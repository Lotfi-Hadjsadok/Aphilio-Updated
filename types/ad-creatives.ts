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
};

export type LoadAdCreativesDnaState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ready"; payload: AdCreativesDnaPayload };

/** One document chunk that scored highest similarity to the selected marketing angles. */
export type SimilarDocument = {
  heading: string | null;
  contentPreview: string;
  imageUrls: string[];
};

/** Reference assets grouped by scraped section heading for the image model (logo is separate). */
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
      /** Flattened image URLs from similar docs — capped at 6, SVGs excluded. */
      referenceImageUrls: string[];
      referenceImageGroups: ReferenceImageGroup[];
    };

/** A selected ad template with its chosen aspect ratio. */
export type SelectedTemplate = {
  templateId: string;
  templateLabel: string;
  aspectRatio: AdAspectRatio;
};

/** A generated image-model prompt for one template + angle combination. */
export type GeneratedAdPrompt = {
  templateId: string;
  templateLabel: string;
  aspectRatio: AdAspectRatio;
  headline: string;
  subheadline: string;
  description: string;
  /** Dominant hex color derived from branding or chosen to fit the brand. */
  primaryColor: string;
  /** Optional complementary accent hex color. */
  accentColor: string | null;
  /** Typography style description (e.g. "Bold geometric sans-serif, all-caps"). */
  fontStyle: string;
  /** Complete, ready-to-send image-generation prompt. */
  filledPrompt: string;
  referenceImageUrls: string[];
  /** Same URLs as {@link referenceImageUrls}, grouped by section for the image model. */
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
      /** ID of the saved GeneratedCreative row — present when R2 save succeeded. */
      creativeId?: string;
    };
