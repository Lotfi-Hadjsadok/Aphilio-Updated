import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { listSavedContexts } from "@/app/actions/scrape";
import {
  getAdStudioResumePayload,
  listAdCreativeStudioSessionsForUser,
} from "@/app/actions/ad-creative-studio-sessions";
import type { LoadAdCreativesDnaState } from "@/types/ad-creatives";
import { requireActiveSubscriptionOrCheckout } from "@/lib/polar/subscription";
import { AdCreativesForm } from "./ad-creatives-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("adStudioTitle"),
    description: t("adStudioDescription"),
  };
}

type PageProps = { searchParams: Promise<{ contextId?: string; sessionId?: string }> };

export default async function AdCreativesPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  await requireActiveSubscriptionOrCheckout({ userId: session.user.id });

  const tDna = await getTranslations("dna");
  const { contextId, sessionId } = await searchParams;
  const [savedContexts, initialStudioSessions, locale] = await Promise.all([
    listSavedContexts(),
    listAdCreativeStudioSessionsForUser(),
    getLocale(),
  ]);

  const resumePayload = sessionId ? await getAdStudioResumePayload(sessionId) : null;
  const resumeLoadError =
    sessionId && !resumePayload
      ? tDna("sessionLoadError")
      : null;

  const initialLoadState: LoadAdCreativesDnaState | undefined = resumePayload
    ? {
        status: "ready",
        payload: {
          ...resumePayload.payload,
          studioSessionId: resumePayload.sessionId,
        },
      }
    : undefined;

  const initialContextIdForPicker = resumePayload?.contextId ?? contextId;

  return (
    <main className="landing-grid-bg ad-studio-page-edge-glow relative flex h-full min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-hidden bg-background text-foreground antialiased">
      <AdCreativesForm
        key={sessionId ?? `ctx-${initialContextIdForPicker ?? "none"}`}
        savedContexts={savedContexts}
        initialStudioSessions={initialStudioSessions}
        initialContextId={initialContextIdForPicker}
        initialLoadState={initialLoadState}
        resumePayload={resumePayload}
        resumeLoadError={resumeLoadError}
        currentLocale={locale}
      />
    </main>
  );
}
