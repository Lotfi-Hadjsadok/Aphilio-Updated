"use server";

import { loadSavedContext } from "@/app/actions/scrape";
import {
  buildAdCreativesModelContextJson,
  enrichFilledTemplates,
  flattenAdCreativesSectionOptions,
  resolveScrapedSectionById,
} from "@/lib/ad-creatives-context";
import { fillTemplatesFromContext } from "@/lib/openrouter";
import { getServerUserId } from "@/lib/server-auth";
import { saasTemplateConstants } from "@/lib/saas-template-constants";
import type {
  GenerateAdTemplatesState,
  LoadAdCreativesDnaState,
} from "@/types/ad-creatives";

const ERR_UNAUTHORIZED = "Unauthorized";

function parseCommaSeparatedIds(raw: string): string[] {
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseTemplateIndexes(raw: string): number[] {
  return parseCommaSeparatedIds(raw)
    .map((part) => Number(part))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= saasTemplateConstants.length);
}

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
      sectionOptions,
    },
  };
}

export async function generateAdTemplatesAction(
  _previous: GenerateAdTemplatesState,
  formData: FormData,
): Promise<GenerateAdTemplatesState> {
  const userId = await getServerUserId();
  if (!userId) return { status: "error", message: ERR_UNAUTHORIZED };

  if (!process.env.OPENROUTER_API_KEY?.trim()) {
    return { status: "error", message: "OpenRouter is not configured. Add OPENROUTER_API_KEY to your environment." };
  }

  const contextId = String(formData.get("contextId") ?? "").trim();
  if (!contextId) return { status: "error", message: "Missing DNA context." };

  const templateIndexes = parseTemplateIndexes(String(formData.get("templateIndexes") ?? ""));
  if (templateIndexes.length === 0) {
    return { status: "error", message: "Select at least one ad template." };
  }

  const sectionIds = parseCommaSeparatedIds(String(formData.get("sectionIds") ?? ""));
  if (sectionIds.length === 0) {
    return { status: "error", message: "Select at least one section to include." };
  }

  const loaded = await loadSavedContext(contextId);
  if (!loaded.ok) return { status: "error", message: loaded.error };

  const resolvedSections = sectionIds.filter((sectionId) => resolveScrapedSectionById(loaded.result, sectionId));
  if (resolvedSections.length === 0) {
    return { status: "error", message: "No valid sections were found for this DNA." };
  }

  const contextString = buildAdCreativesModelContextJson(loaded.result, resolvedSections);

  try {
    const filled = await fillTemplatesFromContext({
      templateIndexes,
      context: contextString,
    });
    if (filled.length === 0) {
      return {
        status: "error",
        message: "The model returned no templates. Try again or adjust your section selection.",
      };
    }
    return { status: "success", templates: enrichFilledTemplates(filled) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong while generating.";
    return { status: "error", message };
  }
}
