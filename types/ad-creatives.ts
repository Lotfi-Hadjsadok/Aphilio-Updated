import type { BrandingDNA } from "@/types/scrape";
import type { FilledTemplate } from "@/types/openrouter";

export type AdCreativesSectionOption = {
  id: string;
  heading: string;
  preview: string;
  sourceLabel: string;
};

export type AdCreativesDnaPayload = {
  contextId: string;
  name: string;
  baseUrl: string;
  branding: BrandingDNA | null;
  sectionOptions: AdCreativesSectionOption[];
};

export type LoadAdCreativesDnaState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ready"; payload: AdCreativesDnaPayload };

export type GenerateAdTemplatesState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; templates: FilledTemplate[] };
