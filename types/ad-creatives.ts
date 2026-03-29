import type { BrandingDNA, BrandingPersonality } from "@/types/scrape";
import type { AdAspectRatio } from "@/lib/ad-creatives-templates";

export type { AdAspectRatio } from "@/lib/ad-creatives-templates";

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
  personality: BrandingPersonality | null;
  marketingAngles: string[] | null;
  sectionOptions: AdCreativesSectionOption[];
  studioSessionId?: string;
};

export type StudioSlotOutcomePersisted = {
  status: "pending" | "success" | "error";
  creativeId?: string;
  imageUrl?: string;
  errorMessage?: string;
};

export type LoadAdCreativesDnaState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ready"; payload: AdCreativesDnaPayload };

export type SimilarDocument = {
  heading: string | null;
  contentPreview: string;
  imageUrls: string[];
};

export type ReferenceImageGroup = {
  sectionTitle: string;
  imageUrls: string[];
};

export type SelectAngleState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      selectedAngles: string[];
      similarDocuments: SimilarDocument[];
      referenceImageUrls: string[];
      referenceImageGroups: ReferenceImageGroup[];
    };

export type SelectedTemplate = {
  templateId: string;
  templateLabel: string;
  aspectRatio: AdAspectRatio;
};

export type GeneratedAdPrompt = {
  templateId: string;
  templateLabel: string;
  aspectRatio: AdAspectRatio;
  headline: string;
  subheadline: string;
  description: string;
  primaryColor: string;
  accentColor: string | null;
  fontStyle: string;
  filledPrompt: string;
  referenceImageUrls: string[];
  referenceImageGroups: ReferenceImageGroup[];
};

export type GenerateAdPromptsInput = {
  brandName: string;
  baseUrl: string;
  branding: BrandingDNA | null;
  personality: BrandingPersonality | null;
  selectedSections: { heading: string | null; markdown: string }[];
  selectedAngles: string[];
  templateId: string;
  templateLabel: string;
  aspectRatio: AdAspectRatio;
};

export type GenerateAdPromptsState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; prompts: GeneratedAdPrompt[] };

export type AdImageGenerationMode = "premium" | "fast";

export type GenerateImageState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "success";
      imageUrl: string;
      referenceImageUrls: string[];
      creativeId?: string;
    };
