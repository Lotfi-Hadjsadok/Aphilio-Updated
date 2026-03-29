"use server";

import { cookies } from "next/headers";
import { isValidLocale } from "@/lib/i18n-locales";
import { getServerSession } from "@/lib/server-auth";
import prisma from "@/lib/prisma";

export async function setLocaleCookieAction(language: string): Promise<void> {
  if (!isValidLocale(language)) return;
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export type UpdatePreferredLanguageState = { ok?: boolean; error?: string };

export async function updatePreferredLanguageAction(
  _prevState: UpdatePreferredLanguageState,
  formData: FormData,
): Promise<UpdatePreferredLanguageState> {
  const session = await getServerSession();
  if (!session) return { error: "Not signed in." };

  const language = String(formData.get("language") ?? "");
  if (!isValidLocale(language)) return { error: "Invalid language." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { preferredLanguage: language },
  });

  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return { ok: true };
}
