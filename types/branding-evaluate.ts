import type { TypographyEntry } from "@/types/scrape";

/** Payload produced by Playwright `page.evaluate` branding extraction. */
export type BrandingPageEvaluatePayload = {
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  /** Font families paired with their typical body/heading weights. */
  typography: TypographyEntry[];
};
