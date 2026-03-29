"use server";

import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { isValidLocale } from "@/lib/i18n-locales";

export type OnboardingState = {
  error?: string;
  success?: boolean;
};

export async function saveOnboardingPreferences(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await getServerSession();
  if (!session) return { error: "You must be signed in." };

  const language = String(formData.get("language") ?? "");
  if (!language) return { error: "Please select a language." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      preferredLanguage: language,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return { success: true };
}

export async function completeOnboarding(): Promise<OnboardingState> {
  const session = await getServerSession();
  if (!session) return { error: "You must be signed in." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      onboardingCompleted: true,
      onboardingStep: 0,
      onboardingDraftUrl: null,
    },
  });

  return { success: true };
}

const MAX_ONBOARDING_STEP = 3;

export async function saveOnboardingProgress(
  step: number,
  draftUrl: string | null,
): Promise<OnboardingState> {
  const session = await getServerSession();
  if (!session) return { error: "You must be signed in." };

  if (!Number.isInteger(step) || step < 0 || step > MAX_ONBOARDING_STEP) {
    return { error: "Invalid onboarding step." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      onboardingStep: step,
      onboardingDraftUrl: draftUrl,
    },
  });

  return { success: true };
}

export async function checkOnboardingStatus(): Promise<boolean> {
  const session = await getServerSession();
  if (!session) return true;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });

  return user?.onboardingCompleted ?? false;
}

export async function findExistingContextByUrl(
  rawUrl: string,
): Promise<string | null> {
  const session = await getServerSession();
  if (!session) return null;

  let hostname: string;
  try {
    hostname = new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }

  const existing = await prisma.scrapedContext.findUnique({
    where: { userId_baseUrl: { userId: session.user.id, baseUrl: hostname } },
    select: { id: true },
  });

  return existing?.id ?? null;
}
