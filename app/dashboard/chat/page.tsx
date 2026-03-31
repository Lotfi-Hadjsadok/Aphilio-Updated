import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { listSavedContexts } from "@/app/actions/scrape";
import { listConversations } from "@/app/actions/chat";
import { requireSubscriptionOrRedirectToPlans } from "@/lib/polar/subscription";
import prisma from "@/lib/prisma";
import { creditStoredUnitsForMode } from "@/lib/polar/ingest-credits";
import type { AdImageGenerationMode } from "@/types/ad-creatives";
import { ChatInterface } from "./chat-interface";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("chatTitle"),
    description: t("chatDescription"),
  };
}

type PageProps = { searchParams: Promise<{ contextId?: string }> };

export default async function ChatPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  await requireSubscriptionOrRedirectToPlans({
    userId: session.user.id,
    returnTo: "/dashboard/chat",
  });

  const { contextId } = await searchParams;

  const [savedContexts, initialConversations, locale, userRow] = await Promise.all([
    listSavedContexts(),
    listConversations(),
    getLocale(),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { aphilioCreditsBalance: true },
    }),
  ]);

  const modes: AdImageGenerationMode[] = ["fast", "premium"];
  const creditCostStoredUnitsByMode = Object.fromEntries(
    modes.map((mode) => [mode, creditStoredUnitsForMode(mode)]),
  ) as Record<AdImageGenerationMode, number>;

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden antialiased">
      <ChatInterface
        savedContexts={savedContexts}
        initialConversations={initialConversations}
        initialContextId={contextId}
        currentLocale={locale}
        initialCreditsBalanceStored={userRow?.aphilioCreditsBalance ?? 0}
        creditCostStoredUnitsByMode={creditCostStoredUnitsByMode}
      />
    </main>
  );
}
