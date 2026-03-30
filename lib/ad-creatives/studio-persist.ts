import type { Prisma } from "@/app/generated/prisma/client";
import type { GeneratedAdPrompt, StudioSlotOutcomePersisted } from "@/types/ad-creatives";

export function defaultSlotOutcomesForPrompts(
  prompts: GeneratedAdPrompt[],
): StudioSlotOutcomePersisted[] {
  return prompts.map(() => ({ status: "pending" as const }));
}

export function parseSlotOutcomesFromJson(value: Prisma.JsonValue | null): StudioSlotOutcomePersisted[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) return [];
  const outcomes: StudioSlotOutcomePersisted[] = [];
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null || !("status" in entry)) continue;
    const record = entry as Record<string, unknown>;
    const status = record.status;
    if (status !== "pending" && status !== "success" && status !== "error") continue;
    const outcome: StudioSlotOutcomePersisted = { status };
    if (typeof record.creativeId === "string") outcome.creativeId = record.creativeId;
    if (typeof record.imageUrl === "string") outcome.imageUrl = record.imageUrl;
    if (typeof record.errorMessage === "string") outcome.errorMessage = record.errorMessage;
    outcomes.push(outcome);
  }
  return outcomes;
}

export function mergeSlotOutcomesForNewPrompts(
  previous: StudioSlotOutcomePersisted[],
  previousPrompts: GeneratedAdPrompt[],
  nextPrompts: GeneratedAdPrompt[],
): StudioSlotOutcomePersisted[] {
  function keyForPrompt(prompt: GeneratedAdPrompt) {
    return `${prompt.templateId}:${prompt.aspectRatio}:${prompt.headline}`;
  }
  const map = new Map<string, StudioSlotOutcomePersisted>();
  previousPrompts.forEach((prompt, index) => {
    const outcome = previous[index];
    if (outcome) map.set(keyForPrompt(prompt), outcome);
  });
  return nextPrompts.map((prompt) => {
    const reused = map.get(keyForPrompt(prompt));
    if (reused?.status === "success" && reused.imageUrl) return reused;
    return { status: "pending" as const };
  });
}
