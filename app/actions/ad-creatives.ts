"use server";

import { loadSavedContext } from "@/app/actions/scrape";
import {
  buildSelectedSectionsForModel,
  flattenAdCreativesSectionOptions,
  resolveScrapedSectionById,
} from "@/lib/ad-creatives-context";
import {
  flattenReferenceImageUrls,
  generateAllAdPromptsFromTemplates,
  generateImageFromPromptForContext,
  generateImageWithKnownReferences,
  findSimilarDocumentsForAngles,
  IMAGE_MODEL_PREMIUM,
  IMAGE_MODEL_FAST,
} from "@/lib/langchain";
import {
  parseCommaSeparatedIds,
  parseJsonStringArray,
  parseReferenceImageGroups,
  parseSelectedTemplates,
  referenceImageGroupsFromLegacyFlatUrls,
} from "@/lib/ad-creatives-form-data";
import { getServerUserId } from "@/lib/server-auth";
import { messageFromUnknownError } from "@/lib/utils";
import { uploadImageToR2 } from "@/lib/r2";
import prisma from "@/lib/prisma";
import type {
  AdImageGenerationMode,
  GenerateAdPromptsState,
  GenerateImageState,
  LoadAdCreativesDnaState,
  SelectAngleState,
} from "@/types/ad-creatives";

const ERR_UNAUTHORIZED = "Unauthorized";

export async function loadDnaForAdCreativesAction(
  _previous: LoadAdCreativesDnaState,
  formData: FormData,
): Promise<LoadAdCreativesDnaState> {
  const userId = await getServerUserId();
  if (!userId) return { status: "error", message: ERR_UNAUTHORIZED };

  const contextId = String(formData.get("contextId") ?? "").trim();
  if (!contextId) return { status: "error", message: "Choose a DNA profile to continue." };

  const loaded = await loadSavedContext(contextId);
  if (!loaded.ok) return { status: "error", message: loaded.error };

  const sectionOptions = flattenAdCreativesSectionOptions(loaded.result);
  if (sectionOptions.length === 0) {
    return {
      status: "error",
      message: "This DNA has no sections to pull copy from. Re-capture the site or pick another profile.",
    };
  }

  return {
    status: "ready",
    payload: {
      contextId: loaded.result.id,
      name: loaded.result.name,
      baseUrl: loaded.result.baseUrl,
      branding: loaded.result.branding,
      personality: loaded.result.personality,
      marketingAngles: loaded.result.marketingAngles,
      sectionOptions,
    },
  };
}

/**
 * Embeds the selected marketing angles and returns the top-5 similar context
 * documents with their image URLs (capped at 6 total). Advances the flow to
 * the "Configure creative" step.
 */
export async function selectAngleWithSimilaritiesAction(
  _previous: SelectAngleState,
  formData: FormData,
): Promise<SelectAngleState> {
  const userId = await getServerUserId();
  if (!userId) return { status: "error", message: ERR_UNAUTHORIZED };

  const contextId = String(formData.get("contextId") ?? "").trim();
  const selectedAngles = parseJsonStringArray(String(formData.get("selectedAngles") ?? "[]"));

  if (!contextId) return { status: "error", message: "Missing DNA context." };
  if (selectedAngles.length === 0) return { status: "error", message: "Select at least one marketing angle to continue." };

  try {
    const { similarDocuments, referenceImageUrls, referenceImageGroups } =
      await findSimilarDocumentsForAngles(selectedAngles, contextId);
    return {
      status: "ready",
      selectedAngles,
      similarDocuments,
      referenceImageUrls,
      referenceImageGroups,
    };
  } catch (error) {
    return {
      status: "error",
      message: messageFromUnknownError(error, "Failed to analyse angle."),
    };
  }
}

/**
 * Generates one image-model prompt per selected template in parallel.
 * Each prompt includes colors, fonts, headline, subheadline, and a complete
 * ready-to-send description tailored to the template format and marketing angle.
 */
export async function generateAdPromptsAction(
  _previous: GenerateAdPromptsState,
  formData: FormData,
): Promise<GenerateAdPromptsState> {
  const userId = await getServerUserId();
  if (!userId) return { status: "error", message: ERR_UNAUTHORIZED };

  const contextId = String(formData.get("contextId") ?? "").trim();
  const selectedAngles = parseJsonStringArray(String(formData.get("selectedAngles") ?? "[]"));
  const sectionIds = parseCommaSeparatedIds(String(formData.get("sectionIds") ?? ""));
  const selectedTemplates = parseSelectedTemplates(String(formData.get("selectedTemplates") ?? "[]"));

  if (!contextId) return { status: "error", message: "Missing DNA context." };
  if (selectedAngles.length === 0) return { status: "error", message: "Missing marketing angle(s)." };
  if (sectionIds.length === 0) {
    return { status: "error", message: "Select at least one section to include." };
  }
  if (selectedTemplates.length === 0) {
    return { status: "error", message: "Select at least one ad template to generate." };
  }

  const loaded = await loadSavedContext(contextId);
  if (!loaded.ok) return { status: "error", message: loaded.error };

  const resolvedSectionIds = sectionIds.filter(
    (sectionId) => resolveScrapedSectionById(loaded.result, sectionId),
  );
  if (resolvedSectionIds.length === 0) {
    return { status: "error", message: "No valid sections were found for this DNA." };
  }

  const selectedSections = buildSelectedSectionsForModel(loaded.result, resolvedSectionIds);

  try {
    const { referenceImageGroups } = await findSimilarDocumentsForAngles(
      selectedAngles,
      contextId,
    );
    const prompts = await generateAllAdPromptsFromTemplates(
      {
        brandName: loaded.result.name,
        baseUrl: loaded.result.baseUrl,
        branding: loaded.result.branding,
        personality: loaded.result.personality,
        selectedSections,
        selectedAngles,
      },
      selectedTemplates,
      referenceImageGroups,
    );

    return { status: "success", prompts };
  } catch (error) {
    return {
      status: "error",
      message: messageFromUnknownError(error, "Something went wrong while generating."),
    };
  }
}

export async function generateImageFromPromptAction(
  _previous: GenerateImageState,
  formData: FormData,
): Promise<GenerateImageState> {
  const userId = await getServerUserId();
  if (!userId) return { status: "error", message: ERR_UNAUTHORIZED };

  const filledPrompt = String(formData.get("filledPrompt") ?? "").trim();
  const contextId = String(formData.get("contextId") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const subheadline = String(formData.get("subheadline") ?? "").trim() || undefined;
  const templateLabel = String(formData.get("templateLabel") ?? "").trim();
  const aspectRatio = String(formData.get("aspectRatio") ?? "").trim();
  const referenceImageUrls = parseJsonStringArray(String(formData.get("referenceImageUrls") ?? "[]"));
  const referenceImageGroupsParse = parseReferenceImageGroups(
    String(formData.get("referenceImageGroups") ?? "[]"),
  );
  const referenceImageGroups =
    referenceImageGroupsParse.length > 0
      ? referenceImageGroupsParse
      : referenceImageGroupsFromLegacyFlatUrls(referenceImageUrls);
  const rawMode = String(formData.get("imageModel") ?? "premium") as AdImageGenerationMode;
  const imageModel = rawMode === "fast" ? IMAGE_MODEL_FAST : IMAGE_MODEL_PREMIUM;

  if (!filledPrompt) return { status: "error", message: "No prompt provided." };
  if (!contextId) return { status: "error", message: "No context ID provided." };

  try {
    let generatedImageUrl: string;
    let finalReferenceImageUrls: string[];

    if (referenceImageGroups.length > 0) {
      generatedImageUrl = await generateImageWithKnownReferences(
        filledPrompt,
        contextId,
        referenceImageGroups,
        imageModel,
      );
      finalReferenceImageUrls = flattenReferenceImageUrls(referenceImageGroups);
    } else {
      const result = await generateImageFromPromptForContext(filledPrompt, contextId, imageModel);
      generatedImageUrl = result.imageUrl;
      finalReferenceImageUrls = result.referenceImageUrls;
    }

    // Upload to Cloudflare R2 and persist metadata in the database.
    // Generation is considered successful only after persistence succeeds.
    const r2Key = `creatives/${userId}/${contextId}/${Date.now()}.webp`;
    const uploaded = await uploadImageToR2({ sourceUrl: generatedImageUrl, key: r2Key });

    const creative = await prisma.generatedCreative.create({
      data: {
        userId,
        contextId,
        r2Key,
        imageUrl: uploaded.publicUrl,
        templateLabel: templateLabel || "Ad creative",
        aspectRatio: aspectRatio || "1:1",
        headline: headline || "Generated ad",
        subheadline,
        prompt: filledPrompt,
      },
    });

    return {
      status: "success",
      imageUrl: uploaded.publicUrl,
      referenceImageUrls: finalReferenceImageUrls,
      creativeId: creative.id,
    };
  } catch (error) {
    return {
      status: "error",
      message: messageFromUnknownError(
        error,
        "Image generation or saving failed. Please try again.",
      ),
    };
  }
}
