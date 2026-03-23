import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listSavedContexts } from "@/app/actions/scrape";
import { ScrapeForm } from "./scrape-form";

export const metadata = {
  title: "Context Retriever",
  description: "Capture full-page URL context — brand DNA and visual identity.",
};

export default async function ContextRetrieverPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const savedContexts = await listSavedContexts();

  return (
    <main className="retriever-shell-bg flex h-[100dvh] min-h-0 w-full flex-col overflow-x-hidden overflow-y-hidden text-foreground antialiased">
      <ScrapeForm savedContexts={savedContexts} />
    </main>
  );
}
