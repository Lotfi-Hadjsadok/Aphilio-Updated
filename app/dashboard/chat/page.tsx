import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { listSavedContexts } from "@/app/actions/scrape";
import { listConversations } from "@/app/actions/chat";
import { requireActiveSubscriptionOrCheckout } from "@/lib/polar/subscription";
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

  await requireActiveSubscriptionOrCheckout({ userId: session.user.id });

  const { contextId } = await searchParams;

  const [savedContexts, initialConversations, locale] = await Promise.all([
    listSavedContexts(),
    listConversations(),
    getLocale(),
  ]);

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden antialiased">
      <ChatInterface
        savedContexts={savedContexts}
        initialConversations={initialConversations}
        initialContextId={contextId}
        currentLocale={locale}
      />
    </main>
  );
}
