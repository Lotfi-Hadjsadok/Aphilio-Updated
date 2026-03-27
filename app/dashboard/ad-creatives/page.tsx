import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listSavedContexts } from "@/app/actions/scrape";
import { AdCreativesForm } from "./ad-creatives-form";

export const metadata = {
  title: "Ad creatives",
  description:
    "Pick saved DNA, a marketing angle, and sections — AI shapes the creative to your angle and generates the image prompt.",
};

type PageProps = { searchParams: Promise<{ contextId?: string }> };

export default async function AdCreativesPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { contextId } = await searchParams;
  const savedContexts = await listSavedContexts();

  return (
    <main className="landing-grid-bg relative flex h-[100dvh] min-h-0 w-full flex-col overflow-x-hidden overflow-y-hidden bg-background text-foreground antialiased">
      <AdCreativesForm savedContexts={savedContexts} initialContextId={contextId} />
    </main>
  );
}
