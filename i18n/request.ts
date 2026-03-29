import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { isValidLocale, type Locale } from "@/lib/i18n-locales";

export {
  SUPPORTED_LOCALES,
  RTL_LOCALES,
  type Locale,
  isValidLocale,
  isRtlLocale,
} from "@/lib/i18n-locales";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("NEXT_LOCALE")?.value ?? "en";
  const locale: Locale = isValidLocale(raw) ? raw : "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
