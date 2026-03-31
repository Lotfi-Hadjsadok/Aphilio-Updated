import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import { LogoutButton } from "@/components/logout-button";
import { OnboardingFlow } from "./onboarding-flow";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("onboardingTitle"),
    description: t("onboardingDescription"),
  };
}

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      onboardingCompleted: true,
      onboardingStep: true,
      onboardingDraftUrl: true,
      preferredLanguage: true,
    },
  });

  if (user?.onboardingCompleted) redirect("/dashboard");

  const tCommon = await getTranslations("common");

  return (
    <main className="landing-grid-bg relative flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden bg-background text-foreground">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="pointer-events-auto">
          <LogoutButton label={tCommon("logout")} />
        </div>
      </header>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute -left-32 top-0 h-96 w-96 bg-accent-gradient opacity-[0.18] sm:h-[28rem] sm:w-[28rem]" />
        <div className="glow-orb absolute -right-24 bottom-10 h-80 w-80 bg-accent-gradient opacity-[0.14] sm:bottom-20" />
        <div className="glow-orb absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-accent-gradient opacity-[0.08]" />
      </div>
      <OnboardingFlow
        userName={session.user.name}
        initialOnboardingStep={user?.onboardingStep ?? 0}
        initialDraftUrl={user?.onboardingDraftUrl ?? ""}
        initialPreferredLanguage={user?.preferredLanguage ?? ""}
      />
    </main>
  );
}
