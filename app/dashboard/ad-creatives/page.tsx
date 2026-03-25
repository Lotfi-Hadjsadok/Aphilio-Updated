import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listSavedContexts } from "@/app/actions/scrape";
import { AdCreativesForm } from "./ad-creatives-form";

export const metadata = {
  title: "Ad creatives",
  description:
    "Pick saved DNA, choose ad templates and page sections, then generate filled prompts with OpenRouter.",
};

export default async function AdCreativesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const savedContexts = await listSavedContexts();

  return (
    <main className="retriever-shell-bg flex h-[100dvh] min-h-0 w-full flex-col overflow-x-hidden overflow-y-hidden text-foreground antialiased">
      <AdCreativesForm savedContexts={savedContexts} />
    </main>
  );
}
