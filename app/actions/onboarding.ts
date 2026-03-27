"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";

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

  return { success: true };
}

export async function completeOnboarding(): Promise<OnboardingState> {
  const session = await getServerSession();
  if (!session) return { error: "You must be signed in." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: true },
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
