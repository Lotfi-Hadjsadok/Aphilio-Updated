import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { isValidLocale, type Locale } from "@/lib/i18n-locales";
import { deepMerge } from "@/lib/deep-merge";

export {
  SUPPORTED_LOCALES,
  RTL_LOCALES,
  type Locale,
  isValidLocale,
  isRtlLocale,
} from "@/lib/i18n-locales";

type MessagesRoot = Record<string, unknown>;

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("NEXT_LOCALE")?.value ?? "en";
  const locale: Locale = isValidLocale(raw) ? raw : "en";

  const englishMessages = (await import("../messages/en.json"))
    .default as MessagesRoot;

  if (locale === "en") {
    return {
      locale,
      messages: englishMessages,
    };
  }

  const localeMessages = (await import(`../messages/${locale}.json`))
    .default as MessagesRoot;

  return {
    locale,
    messages: deepMerge(englishMessages, localeMessages),
  };
});
