import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { loadSavedContext } from "@/app/actions/scrape";
import { ResultExperience } from "@/app/dashboard/context-retriever/context-result-view";
import { getUserSubscriptionStatus } from "@/lib/polar-subscription";

type PageProps = { params: Promise<{ contextId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations("metadata");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { title: t("dnaPageTitle") };
  }

  const { contextId } = await params;
  const loaded = await loadSavedContext(contextId);
  if (!loaded.ok) {
    return { title: t("dnaPageTitle") };
  }

  return {
    title: t("dnaPreviewPageTitle", { name: loaded.result.name }),
    description: t("dnaPreviewPageDescription", {
      name: loaded.result.name,
      baseUrl: loaded.result.baseUrl,
    }),
  };
}

export default async function SavedContextPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { contextId } = await params;
  const loaded = await loadSavedContext(contextId);
  if (!loaded.ok) redirect("/dashboard/dna");

  const isSubscribed = await getUserSubscriptionStatus(session.user.id);

  return (
    <main className="dna-preview-shell-bg relative flex h-full min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-hidden bg-background text-foreground antialiased">
      <ResultExperience
        result={loaded.result}
        fromLibrary
        backHref="/dashboard/dna"
        isSubscribed={isSubscribed}
      />
    </main>
  );
}

