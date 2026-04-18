import { LOCALE_OPTIONS } from "@/lib/locale-options";
import { isValidLocale, type Locale } from "@/lib/i18n-locales";

export function normalizeOutputLanguage(code: string | undefined | null): Locale {
  const trimmed = (code ?? "").trim();
  if (isValidLocale(trimmed)) return trimmed;
  return "en";
}

export function labelForOutputLanguage(code: Locale): string {
  return LOCALE_OPTIONS.find((item) => item.code === code)?.label ?? code;
}
