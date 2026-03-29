"use client";

import { useEffect } from "react";
import { setLocaleCookieAction } from "@/app/actions/locale";
import { isValidLocale } from "@/lib/i18n-locales";

/**
 * Seeds NEXT_LOCALE from the account preference only when no valid cookie exists
 * (e.g. first visit). Does not overwrite a cookie the user set via the language switcher.
 */
export function LocaleSync({ preferredLanguage }: { preferredLanguage: string }) {
  useEffect(() => {
    if (!preferredLanguage) return;
    const currentCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="))
      ?.split("=")[1];

    if (currentCookie && isValidLocale(currentCookie)) return;

    void setLocaleCookieAction(preferredLanguage);
  }, [preferredLanguage]);

  return null;
}
