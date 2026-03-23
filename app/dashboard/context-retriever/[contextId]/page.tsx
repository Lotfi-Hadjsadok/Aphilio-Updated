import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { loadSavedContext } from "@/app/actions/scrape";
import { ResultExperience } from "../context-result-view";

type PageProps = { params: Promise<{ contextId: string }> };

export async function generateMetadata({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { title: "Context" };

  const { contextId } = await params;
  const loaded = await loadSavedContext(contextId);
  if (!loaded.ok) return { title: "Context not found" };

  return {
    title: `${loaded.result.name} · Context`,
    description: `Saved brand context for ${loaded.result.baseUrl}`,
  };
}

export default async function SavedContextPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { contextId } = await params;
  const loaded = await loadSavedContext(contextId);
  if (!loaded.ok) notFound();

  return (
    <main className="retriever-shell-bg flex h-[100dvh] min-h-0 w-full flex-col overflow-x-hidden overflow-y-hidden text-foreground antialiased">
      <ResultExperience
        result={loaded.result}
        fromLibrary
        backHref="/dashboard/context-retriever"
      />
    </main>
  );
}
