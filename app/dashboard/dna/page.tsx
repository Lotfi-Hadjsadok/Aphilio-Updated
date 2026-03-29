import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { listSavedContexts } from "@/app/actions/scrape";
import { ScrapeForm } from "../context-retriever/scrape-form";
import prisma from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("dnaPageTitle"),
    description: t("dnaPageDescription"),
  };
}

export default async function DnaPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });
  if (!user?.onboardingCompleted) redirect("/dashboard/onboarding");

  const savedContexts = await listSavedContexts();

  return (
    <main className="landing-grid-bg relative flex h-full min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-hidden bg-background text-foreground antialiased">
      <ScrapeForm savedContexts={savedContexts} />
    </main>
  );
}

