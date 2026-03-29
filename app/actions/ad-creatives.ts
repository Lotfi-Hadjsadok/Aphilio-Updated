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
import type { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import {
  defaultSlotOutcomesForPrompts,
  mergeSlotOutcomesForNewPrompts,
  parseSlotOutcomesFromJson,
} from "@/lib/ad-creative-studio-persist";
import type {
  AdCreativesDnaPayload,
  AdImageGenerationMode,
  GeneratedAdPrompt,
  GenerateAdPromptsState,
  GenerateImageState,
  LoadAdCreativesDnaState,
  SelectAngleState,
  StudioSlotOutcomePersisted,
} from "@/types/ad-creatives";

const ERR_UNAUTHORIZED = "Unauthorized";

export async function getAdCreativesDnaPayloadForContext(
  contextId: string,
): Promise<{ ok: true; payload: AdCreativesDnaPayload } | { ok: false; error: string }> {
  const loaded = await loadSavedContext(contextId);
  if (!loaded.ok) return { ok: false, error: loaded.error };

  const sectionOptions = flattenAdCreativesSectionOptions(loaded.result);
  if (sectionOptions.length === 0) {
    return {
      ok: false,
      error:
        "This brand has no usable blocks yet. Refresh it from your library or pick another brand.",
    };
  }

  return {
    ok: true,
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

export async function loadDnaForAdCreativesAction(
  _previous: LoadAdCreativesDnaState,
  formData: FormData,
): Promise<LoadAdCreativesDnaState> {
  const userId = await getServerUserId();
  if (!userId) return { status: "error", message: ERR_UNAUTHORIZED };

  const contextId = String(formData.get("contextId") ?? "").trim();
  if (!contextId) return { status: "error", message: "Choose a brand to continue." };

  const dna = await getAdCreativesDnaPayloadForContext(contextId);
  if (!dna.ok) return { status: "error", message: dna.error };

  const studioRow = await prisma.adCreativeStudioSession.create({
    data: {
      userId,
      contextId: dna.payload.contextId,
      title: `${dna.payload.name} · Ad studio`,
      contextNameCache: dna.payload.name,
      activeStep: 2,
      furthestStep: 2,
    },
  });

  return {
    status: "ready",
    payload: {
      ...dna.payload,
      studioSessionId: studioRow.id,
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

  if (!contextId) return { status: "error", message: "Missing brand context." };
  if (selectedAngles.length === 0) return { status: "error", message: "Select at least one focus option to continue." };

  try {
    const { similarDocuments, referenceImageUrls, referenceImageGroups } =
      await findSimilarDocumentsForAngles(selectedAngles, contextId);

    const studioSessionId = String(formData.get("studioSessionId") ?? "").trim();
    if (studioSessionId) {
      const existing = await prisma.adCreativeStudioSession.findFirst({
        where: { id: studioSessionId, userId },
      });
      if (existing) {
        const angleSnapshot = {
          selectedAngles,
          similarDocuments,
          referenceImageUrls,
          referenceImageGroups,
        };
        await prisma.adCreativeStudioSession.update({
          where: { id: studioSessionId },
          data: {
            selectedAngles: selectedAngles as Prisma.InputJsonValue,
            angleStepData: angleSnapshot as Prisma.InputJsonValue,
            activeStep: 3,
            furthestStep: Math.max(existing.furthestStep, 3),
          },
        });
      }
    }

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
      message: messageFromUnknownError(error, "Could not continue. Try again."),
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

  if (!contextId) return { status: "error", message: "Missing brand context." };
  if (selectedAngles.length === 0) return { status: "error", message: "Missing focus selection." };
  if (sectionIds.length === 0) {
    return { status: "error", message: "Turn on at least one block to include." };
  }
  if (selectedTemplates.length === 0) {
    return { status: "error", message: "Select at least one layout to generate." };
  }

  const loaded = await loadSavedContext(contextId);
  if (!loaded.ok) return { status: "error", message: loaded.error };

  const resolvedSectionIds = sectionIds.filter(
    (sectionId) => resolveScrapedSectionById(loaded.result, sectionId),
  );
  if (resolvedSectionIds.length === 0) {
    return { status: "error", message: "No valid blocks were found for this brand." };
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

    const studioSessionId = String(formData.get("studioSessionId") ?? "").trim();
    if (studioSessionId) {
      const existing = await prisma.adCreativeStudioSession.findFirst({
        where: { id: studioSessionId, userId },
      });
      if (existing) {
        let slotOutcomes: StudioSlotOutcomePersisted[] = defaultSlotOutcomesForPrompts(prompts);
        const previousRaw = existing.prompts;
        if (Array.isArray(previousRaw) && previousRaw.length > 0) {
          const previousPrompts = previousRaw as unknown as GeneratedAdPrompt[];
          slotOutcomes = mergeSlotOutcomesForNewPrompts(
            parseSlotOutcomesFromJson(existing.slotOutcomes),
            previousPrompts,
            prompts,
          );
        }
        await prisma.adCreativeStudioSession.update({
          where: { id: studioSessionId },
          data: {
            sectionIds: resolvedSectionIds as Prisma.InputJsonValue,
            selectedTemplates: selectedTemplates as unknown as Prisma.InputJsonValue,
            prompts: prompts as unknown as Prisma.InputJsonValue,
            slotOutcomes: slotOutcomes as unknown as Prisma.InputJsonValue,
            activeStep: 4,
            furthestStep: Math.max(existing.furthestStep, 4),
          },
        });
      }
    }

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
  const studioSessionId = String(formData.get("studioSessionId") ?? "").trim();
  const slotIndexParsed = Number(formData.get("slotIndex") ?? -1);
  const slotIndex = Number.isFinite(slotIndexParsed) ? Math.floor(slotIndexParsed) : -1;

  if (!filledPrompt) return { status: "error", message: "Something went wrong. Please try again." };
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
        studioSessionId: studioSessionId.length > 0 ? studioSessionId : null,
        slotIndex: studioSessionId.length > 0 && slotIndex >= 0 ? slotIndex : null,
      },
    });

    if (studioSessionId.length > 0 && slotIndex >= 0) {
      const sessionRow = await prisma.adCreativeStudioSession.findFirst({
        where: { id: studioSessionId, userId },
      });
      if (sessionRow) {
        const outcomes = parseSlotOutcomesFromJson(sessionRow.slotOutcomes);
        while (outcomes.length <= slotIndex) {
          outcomes.push({ status: "pending" });
        }
        outcomes[slotIndex] = {
          status: "success",
          creativeId: creative.id,
          imageUrl: uploaded.publicUrl,
        };
        await prisma.adCreativeStudioSession.update({
          where: { id: studioSessionId },
          data: { slotOutcomes: outcomes as unknown as Prisma.InputJsonValue },
        });
      }
    }

    return {
      status: "success",
      imageUrl: uploaded.publicUrl,
      referenceImageUrls: finalReferenceImageUrls,
      creativeId: creative.id,
    };
  } catch (error) {
    const errorMessage = messageFromUnknownError(
      error,
      "Image generation or saving failed. Please try again.",
    );
    if (studioSessionId.length > 0 && slotIndex >= 0) {
      const sessionRow = await prisma.adCreativeStudioSession.findFirst({
        where: { id: studioSessionId, userId },
      });
      if (sessionRow) {
        const outcomes = parseSlotOutcomesFromJson(sessionRow.slotOutcomes);
        while (outcomes.length <= slotIndex) {
          outcomes.push({ status: "pending" });
        }
        outcomes[slotIndex] = {
          status: "error",
          errorMessage,
        };
        await prisma.adCreativeStudioSession.update({
          where: { id: studioSessionId },
          data: { slotOutcomes: outcomes as unknown as Prisma.InputJsonValue },
        });
      }
    }
    return {
      status: "error",
      message: errorMessage,
    };
  }
}
