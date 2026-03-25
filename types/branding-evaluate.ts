/** Payload produced by Playwright `page.evaluate` branding extraction. */
export type BrandingPageEvaluatePayload = {
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  primaryFont: string | null;
  secondaryFont: string | null;
  typography: string | null;
};
