"use server";

import { cookies } from "next/headers";
import { isValidLocale } from "@/lib/i18n-locales";
import { getServerSession } from "@/lib/server-auth";
import prisma from "@/lib/prisma";

/** Shared helper: persists locale to the `NEXT_LOCALE` cookie. */
export async function persistLocaleCookie(language: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export async function setLocaleCookieAction(language: string): Promise<void> {
  if (!isValidLocale(language)) return;
  await persistLocaleCookie(language);
}

export type UpdatePreferredLanguageState = { ok?: boolean; error?: string };

export async function updatePreferredLanguageAction(
  _prevState: UpdatePreferredLanguageState,
  formData: FormData,
): Promise<UpdatePreferredLanguageState> {
  const language = String(formData.get("language") ?? "");
  if (!isValidLocale(language)) return { error: "Invalid language." };

  const session = await getServerSession();
  if (session) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { preferredLanguage: language },
    });
  }

  await persistLocaleCookie(language);

  return { ok: true };
}
