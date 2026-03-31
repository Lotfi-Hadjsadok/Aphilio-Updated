import "server-only";

import {
  flattenReferenceImageUrls,
  generateImageFromPromptForContext,
  generateImageWithKnownReferences,
  IMAGE_MODEL_FAST,
  IMAGE_MODEL_PREMIUM,
} from "@/lib/langchain";
import {
  parseJsonStringArray,
  parseReferenceImageGroups,
  referenceImageGroupsFromLegacyFlatUrls,
} from "@/lib/ad-creatives/form-data";
import { creditCostForMode } from "@/lib/polar/credits-units";
import {
  enqueuePolarCreditUsageIngest,
  revertOptimisticCreditsDeduction,
  reserveCreditsAtGenerationStart,
} from "@/lib/polar/ingest-credits";
import { messageFromUnknownError } from "@/lib/utils";
import { uploadImageToR2 } from "@/lib/r2";
import type { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { parseSlotOutcomesFromJson } from "@/lib/ad-creatives/studio-persist";
import type { AdImageGenerationMode, GenerateImageState, StudioSlotOutcomePersisted } from "@/types/ad-creatives";

type SessionClient = {
  adCreativeStudioSession: Pick<
    typeof prisma["adCreativeStudioSession"],
    "findFirst" | "update"
  >;
};

async function applySlotOutcomeToSession(
  client: SessionClient,
  studioSessionId: string,
  userId: string,
  slotIndex: number,
  outcome: StudioSlotOutcomePersisted,
): Promise<void> {
  const sessionRow = await client.adCreativeStudioSession.findFirst({
    where: { id: studioSessionId, userId },
  });
  if (!sessionRow) return;
  const outcomes = parseSlotOutcomesFromJson(sessionRow.slotOutcomes);
  while (outcomes.length <= slotIndex) {
    outcomes.push({ status: "pending" });
  }
  outcomes[slotIndex] = outcome;
  await client.adCreativeStudioSession.update({
    where: { id: studioSessionId },
    data: { slotOutcomes: outcomes as unknown as Prisma.InputJsonValue },
  });
}

export async function runGenerateImageFromFormData(
  userId: string,
  formData: FormData,
): Promise<GenerateImageState> {
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
  const rawMode = String(formData.get("imageModel") ?? "fast") as AdImageGenerationMode;
  const imageModel = rawMode === "fast" ? IMAGE_MODEL_FAST : IMAGE_MODEL_PREMIUM;
  const studioSessionId = String(formData.get("studioSessionId") ?? "").trim();
  const slotIndexParsed = Number(formData.get("slotIndex") ?? -1);
  const slotIndex = Number.isFinite(slotIndexParsed) ? Math.floor(slotIndexParsed) : -1;

  if (!filledPrompt) return { status: "error", message: "Something went wrong. Please try again." };
  if (!contextId) return { status: "error", message: "No context ID provided." };

  const creditCost = creditCostForMode(rawMode);
  const reservedAtStart = await reserveCreditsAtGenerationStart(userId, creditCost);
  if (!reservedAtStart.ok) {
    return { status: "error", message: reservedAtStart.message };
  }

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

    const r2Key = `creatives/${userId}/${contextId}/${Date.now()}.webp`;
    const { publicUrl } = await uploadImageToR2({ sourceUrl: generatedImageUrl, key: r2Key });

    const creative = await prisma.$transaction(async (transaction) => {
      const row = await transaction.generatedCreative.create({
        data: {
          userId,
          contextId,
          r2Key,
          imageUrl: publicUrl,
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
        await applySlotOutcomeToSession(transaction, studioSessionId, userId, slotIndex, {
          status: "success",
          creativeId: row.id,
          imageUrl: publicUrl,
        });
      }

      return row;
    });

    enqueuePolarCreditUsageIngest(userId, creditCost);

    return {
      status: "success",
      imageUrl: publicUrl,
      referenceImageUrls: finalReferenceImageUrls,
      creativeId: creative.id,
    };
  } catch (error) {
    await revertOptimisticCreditsDeduction(userId, creditCost);
    const errorMessage = messageFromUnknownError(
      error,
      "Image generation or saving failed. Please try again.",
    );
    if (studioSessionId.length > 0 && slotIndex >= 0) {
      await applySlotOutcomeToSession(prisma, studioSessionId, userId, slotIndex, {
        status: "error",
        errorMessage,
      });
    }
    return {
      status: "error",
      message: errorMessage,
    };
  }
}
