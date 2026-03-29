/** Shared locale constants and guards (safe for Client Components — no `next/headers`). */

export const SUPPORTED_LOCALES = [
  "en", "fr", "ar", "es", "de", "pt", "it", "nl",
  "tr", "ja", "ko", "zh", "ru", "hi", "pl", "sv",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const RTL_LOCALES: Locale[] = ["ar"];

export function isValidLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function isRtlLocale(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}
