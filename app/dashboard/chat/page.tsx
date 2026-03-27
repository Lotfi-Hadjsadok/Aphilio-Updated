import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listSavedContexts } from "@/app/actions/scrape";
import { listConversations } from "@/app/actions/chat";
import { ChatInterface } from "./chat-interface";

export const metadata = {
  title: "Chat",
  description:
    "Chat with Aphilio — describe what you want and get an AI-generated image, grounded in your brand DNA.",
};

type PageProps = { searchParams: Promise<{ contextId?: string }> };

export default async function ChatPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { contextId } = await searchParams;

  const [savedContexts, initialConversations] = await Promise.all([
    listSavedContexts(),
    listConversations(),
  ]);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden antialiased">
      <ChatInterface
        savedContexts={savedContexts}
        initialConversations={initialConversations}
        initialContextId={contextId}
      />
    </main>
  );
}
