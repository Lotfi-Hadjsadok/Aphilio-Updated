"use server";

import prisma from "@/lib/prisma";
import { deleteImageFromR2 } from "@/lib/r2";
import { requireAuth, requireAuthAndSubscription, ERR_UNAUTHORIZED } from "@/lib/auth-guard";
import { messageFromUnknownError } from "@/lib/utils";
import { getAdCreativesDnaPayloadForContext } from "@/app/actions/ad-creatives";
import { parseSlotOutcomesFromJson } from "@/lib/ad-creatives/studio-persist";
import { filterStringArray, filterSelectedTemplates } from "@/lib/ad-creatives/form-data";
import type {
  AdCreativesDnaPayload,
  GeneratedAdPrompt,
  ReferenceImageGroup,
  SelectAngleState,
  SelectedTemplate,
  SimilarDocument,
  StudioSlotOutcomePersisted,
} from "@/types/ad-creatives";

export type AdStudioSessionListItem = {
  id: string;
  title: string;
  contextId: string;
  contextNameCache: string;
  updatedAt: string;
  activeStep: number;
  furthestStep: number;
  previewImageUrl: string | null;
};

export type AdStudioResumePayload = {
  sessionId: string;
  contextId: string;
  title: string;
  activeStep: 2 | 3 | 4;
  furthestStep: number;
  payload: AdCreativesDnaPayload;
  pickedAngles: string[];
  selectAngleState: SelectAngleState;
  selectedSectionIds: string[];
  selectedTemplates: SelectedTemplate[];
  prompts: GeneratedAdPrompt[] | null;
  slotOutcomes: StudioSlotOutcomePersisted[];
};

export type ListAdStudioSessionsState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; items: AdStudioSessionListItem[] };

export type DeleteAdStudioSessionState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; deletedSessionId: string };

function parseGeneratedPrompts(value: unknown): GeneratedAdPrompt[] | null {
  if (!Array.isArray(value)) return null;
  const out: GeneratedAdPrompt[] = [];
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) continue;
    const record = entry as Record<string, unknown>;
    if (
      typeof record.templateId === "string" &&
      typeof record.templateLabel === "string" &&
      typeof record.aspectRatio === "string" &&
      typeof record.headline === "string" &&
      typeof record.subheadline === "string" &&
      typeof record.description === "string" &&
      typeof record.primaryColor === "string" &&
      (record.accentColor === null || typeof record.accentColor === "string") &&
      typeof record.fontStyle === "string" &&
      typeof record.filledPrompt === "string"
    ) {
      const refUrls = filterStringArray(record.referenceImageUrls);
      const groups: ReferenceImageGroup[] = [];
      if (Array.isArray(record.referenceImageGroups)) {
        for (const groupEntry of record.referenceImageGroups) {
          if (typeof groupEntry !== "object" || groupEntry === null) continue;
          const groupRecord = groupEntry as Record<string, unknown>;
          if (typeof groupRecord.sectionTitle === "string" && Array.isArray(groupRecord.imageUrls)) {
            const imageUrls = groupRecord.imageUrls.filter((url): url is string => typeof url === "string");
            groups.push({ sectionTitle: groupRecord.sectionTitle, imageUrls });
          }
        }
      }
      out.push({
        templateId: record.templateId,
        templateLabel: record.templateLabel,
        aspectRatio: record.aspectRatio as GeneratedAdPrompt["aspectRatio"],
        headline: record.headline,
        subheadline: record.subheadline,
        description: record.description,
        primaryColor: record.primaryColor,
        accentColor: record.accentColor,
        fontStyle: record.fontStyle,
        filledPrompt: record.filledPrompt,
        referenceImageUrls: refUrls,
        referenceImageGroups: groups,
      });
    }
  }
  return out.length > 0 ? out : null;
}

function parseAngleStepReady(
  angleStepData: unknown,
  selectedAngles: string[],
): SelectAngleState {
  if (typeof angleStepData !== "object" || angleStepData === null) {
    return { status: "idle" };
  }
  const record = angleStepData as Record<string, unknown>;
  const similarRaw = record.similarDocuments;
  const similarDocuments: SimilarDocument[] = [];
  if (Array.isArray(similarRaw)) {
    for (const doc of similarRaw) {
      if (typeof doc !== "object" || doc === null) continue;
      const documentRecord = doc as Record<string, unknown>;
      const imageUrls = Array.isArray(documentRecord.imageUrls)
        ? documentRecord.imageUrls.filter((url): url is string => typeof url === "string")
        : [];
      similarDocuments.push({
        heading: typeof documentRecord.heading === "string" ? documentRecord.heading : null,
        contentPreview:
          typeof documentRecord.contentPreview === "string" ? documentRecord.contentPreview : "",
        imageUrls,
      });
    }
  }
  const referenceImageUrls = filterStringArray(record.referenceImageUrls);
  const referenceImageGroups: ReferenceImageGroup[] = [];
  const groupsRaw = record.referenceImageGroups;
  if (Array.isArray(groupsRaw)) {
    for (const groupEntry of groupsRaw) {
      if (typeof groupEntry !== "object" || groupEntry === null) continue;
      const groupRecord = groupEntry as Record<string, unknown>;
      if (typeof groupRecord.sectionTitle === "string" && Array.isArray(groupRecord.imageUrls)) {
        const imageUrls = groupRecord.imageUrls.filter((url): url is string => typeof url === "string");
        referenceImageGroups.push({ sectionTitle: groupRecord.sectionTitle, imageUrls });
      }
    }
  }
  return {
    status: "ready",
    selectedAngles,
    similarDocuments,
    referenceImageUrls,
    referenceImageGroups,
  };
}

export async function getAdStudioResumePayload(sessionId: string): Promise<AdStudioResumePayload | null> {
  const guard = await requireAuthAndSubscription();
  if (!guard.authorized) return null;
  const { userId } = guard;

  const row = await prisma.adCreativeStudioSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!row) return null;

  const dna = await getAdCreativesDnaPayloadForContext(row.contextId);
  if (!dna.ok) return null;

  const selectedAngles = filterStringArray(row.selectedAngles);
  const angleData = row.angleStepData;
  let selectAngleState: SelectAngleState =
    row.furthestStep >= 3 && selectedAngles.length > 0
      ? parseAngleStepReady(angleData, selectedAngles)
      : { status: "idle" };

  if (selectAngleState.status !== "ready" && row.furthestStep >= 3 && selectedAngles.length > 0) {
    selectAngleState = {
      status: "ready",
      selectedAngles,
      similarDocuments: [],
      referenceImageUrls: [],
      referenceImageGroups: [],
    };
  }

  const sectionIds = filterStringArray(row.sectionIds);
  const selectedTemplates = filterSelectedTemplates(row.selectedTemplates);
  const prompts = parseGeneratedPrompts(row.prompts);
  let slotOutcomes = parseSlotOutcomesFromJson(row.slotOutcomes);
  if (prompts && prompts.length > 0) {
    const creativesBySlot = await prisma.generatedCreative.findMany({
      where: { studioSessionId: row.id, userId },
      select: { slotIndex: true, id: true, imageUrl: true },
    });
    while (slotOutcomes.length < prompts.length) {
      slotOutcomes.push({ status: "pending" });
    }
    for (const creative of creativesBySlot) {
      const index = creative.slotIndex;
      if (index !== null && index >= 0 && index < prompts.length) {
        slotOutcomes[index] = {
          status: "success",
          creativeId: creative.id,
          imageUrl: creative.imageUrl,
        };
      }
    }
  }

  const activeStepRaw = row.activeStep;
  const activeStep: 2 | 3 | 4 =
    activeStepRaw === 3 || activeStepRaw === 4 ? activeStepRaw : 2;

  return {
    sessionId: row.id,
    contextId: row.contextId,
    title: row.title,
    activeStep,
    furthestStep: row.furthestStep,
    payload: dna.payload,
    pickedAngles: selectedAngles,
    selectAngleState,
    selectedSectionIds:
      sectionIds.length > 0 ? sectionIds : dna.payload.sectionOptions.map((option) => option.id),
    selectedTemplates,
    prompts,
    slotOutcomes,
  };
}

/** Server-only list for RSC pages; same shape as search action results. */
export async function listAdCreativeStudioSessionsForUser(
  query: string = "",
): Promise<AdStudioSessionListItem[]> {
  const guard = await requireAuthAndSubscription();
  if (!guard.authorized) return [];
  const { userId } = guard;

  const trimmed = query.trim();

  const rows = await prisma.adCreativeStudioSession.findMany({
    where: {
      userId,
      ...(trimmed.length > 0
        ? {
            OR: [
              { title: { contains: trimmed, mode: "insensitive" } },
              { contextNameCache: { contains: trimmed, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 40,
    include: {
      generatedCreatives: {
        where: { imageUrl: { not: "" } },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { imageUrl: true },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    contextId: row.contextId,
    contextNameCache: row.contextNameCache,
    updatedAt: row.updatedAt.toISOString(),
    activeStep: row.activeStep,
    furthestStep: row.furthestStep,
    previewImageUrl: row.generatedCreatives[0]?.imageUrl ?? null,
  }));
}

export async function listAdCreativeStudioSessionsAction(
  _previous: ListAdStudioSessionsState,
  formData: FormData,
): Promise<ListAdStudioSessionsState> {
  const guard = await requireAuthAndSubscription();
  if (!guard.authorized) return { status: "error", message: guard.reason };

  const query = String(formData.get("query") ?? "").trim();
  const items = await listAdCreativeStudioSessionsForUser(query);
  return { status: "success", items };
}

export async function updateAdStudioSessionActiveStepAction(
  _previous: { status: "idle" | "error"; message?: string },
  formData: FormData,
): Promise<{ status: "idle" | "error"; message?: string }> {
  const guard = await requireAuthAndSubscription();
  if (!guard.authorized) return { status: "error", message: guard.reason };
  const { userId } = guard;

  const sessionId = String(formData.get("studioSessionId") ?? "").trim();
  const stepRaw = Number(formData.get("activeStep") ?? 2);
  const activeStep = stepRaw === 3 || stepRaw === 4 ? stepRaw : 2;
  if (!sessionId) return { status: "error", message: "Missing session." };

  const updated = await prisma.adCreativeStudioSession.updateMany({
    where: { id: sessionId, userId },
    data: { activeStep },
  });
  if (updated.count === 0) return { status: "error", message: "Session not found." };
  return { status: "idle" };
}

export async function deleteAdCreativeStudioSessionAction(
  _previous: DeleteAdStudioSessionState,
  formData: FormData,
): Promise<DeleteAdStudioSessionState> {
  const guard = await requireAuthAndSubscription();
  if (!guard.authorized) return { status: "error", message: guard.reason };
  const { userId } = guard;

  const sessionId = String(formData.get("studioSessionId") ?? "").trim();
  if (!sessionId) return { status: "error", message: "Missing session." };

  const sessionRow = await prisma.adCreativeStudioSession.findFirst({
    where: { id: sessionId, userId },
    select: { id: true },
  });
  if (!sessionRow) return { status: "error", message: "Session not found." };

  try {
    const linkedCreatives = await prisma.generatedCreative.findMany({
      where: { studioSessionId: sessionId, userId },
      select: { id: true, r2Key: true },
    });

    await Promise.all(
      linkedCreatives.map((creative) =>
        Promise.all([
          deleteImageFromR2(creative.r2Key),
          prisma.generatedCreative.delete({ where: { id: creative.id } }),
        ]),
      ),
    );

    await prisma.adCreativeStudioSession.delete({
      where: { id: sessionId },
    });

    return { status: "success", deletedSessionId: sessionId };
  } catch (error) {
    return {
      status: "error",
      message: messageFromUnknownError(error, "Failed to delete studio session."),
    };
  }
}
