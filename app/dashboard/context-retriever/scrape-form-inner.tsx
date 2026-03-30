"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { scrapeWebsite, deleteSavedContext } from "@/app/actions/scrape";
import type { DeleteDNAState, SavedContextSummary, ScrapeState } from "@/types/scrape";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardToolPageGutterClass } from "@/lib/dashboard-tool-layout";
import { ScrapeStep } from "@/app/dashboard/onboarding/steps/scrape-step";
import { BrandDnaToolHeader } from "./brand-dna-tool-header";

const initialState: ScrapeState = {};
const initialDeleteState: DeleteDNAState = {};

export function ScrapeFormInner({ savedContexts }: { savedContexts: SavedContextSummary[] }) {
  const tDna = useTranslations("dna");
  const [scrapeState, formAction, scrapePending] = useActionState(scrapeWebsite, initialState);
  const router = useRouter();
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteSavedContext,
    initialDeleteState,
  );
  useEffect(() => {
    if (deleteState.deletedContextId) router.push("/dashboard/dna");
  }, [deleteState.deletedContextId, router]);

  const result = scrapeState.result;
  const error = result ? undefined : scrapeState.error;
  const hasSavedContexts = savedContexts.length > 0;
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(false);
  const libraryPanelRef = useRef<HTMLDivElement | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState("");

  const [navigatedToResult, setNavigatedToResult] = useState(false);
  useEffect(() => {
    if (!result?.id || navigatedToResult) return;
    setNavigatedToResult(true);
    router.push(`/dashboard/dna/${result.id}`);
  }, [navigatedToResult, result?.id, router]);

  useEffect(() => {
    if (!isLibraryExpanded || !hasSavedContexts) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (libraryPanelRef.current?.contains(target)) return;
      if (target instanceof Element) {
        if (target.closest("[aria-modal='true']")) return;
        if (target.closest('[role="dialog"]')) return;
        if (target.closest('[role="alertdialog"]')) return;
      }
      setIsLibraryExpanded(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isLibraryExpanded, hasSavedContexts]);

  const showOnboardingStyleScrapeStep = scrapePending || !!result;
  const scrapeStepUrl = result?.baseUrl ?? submittedUrl;

  if (showOnboardingStyleScrapeStep) {
    if (scrapePending) {
      return (
        <div className="fixed inset-0 z-[200] flex min-h-dvh w-screen flex-col overflow-hidden bg-background">
          <BrandDnaToolHeader
            savedContexts={savedContexts}
            deleteFormAction={deleteFormAction}
            deletePending={deletePending}
            expanded={isLibraryExpanded}
            onExpandedChange={setIsLibraryExpanded}
            libraryPanelRef={libraryPanelRef}
          />
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto overflow-x-hidden pb-[max(1rem,env(safe-area-inset-bottom))] pt-4",
              dashboardToolPageGutterClass,
            )}
            aria-busy="true"
            aria-live="polite"
          >
            <ScrapeStep
              url={scrapeStepUrl}
              pending
              error={undefined}
              result={undefined}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <BrandDnaToolHeader
          savedContexts={savedContexts}
          deleteFormAction={deleteFormAction}
          deletePending={deletePending}
          expanded={isLibraryExpanded}
          onExpandedChange={setIsLibraryExpanded}
          libraryPanelRef={libraryPanelRef}
        />

        <div className="relative flex min-h-0 flex-1 flex-col">
          <ScrapeStep
            url={scrapeStepUrl}
            pending={scrapePending}
            error={undefined}
            result={result}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <BrandDnaToolHeader
        savedContexts={savedContexts}
        deleteFormAction={deleteFormAction}
        deletePending={deletePending}
        expanded={isLibraryExpanded}
        onExpandedChange={setIsLibraryExpanded}
        libraryPanelRef={libraryPanelRef}
      />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="glow-orb absolute -left-24 top-8 h-72 w-72 bg-accent-gradient opacity-[0.12]" />
          <div className="glow-orb absolute -right-16 bottom-16 h-56 w-56 bg-accent-gradient opacity-[0.1]" />
        </div>

        <div
          className={cn(
            "relative flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center overflow-y-auto overflow-x-hidden pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:pb-12 sm:pt-8",
            dashboardToolPageGutterClass,
          )}
        >
          <div className="mb-6 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient-subtle shadow-lg ring-1 ring-border/60 sm:h-20 sm:w-20">
            <Globe className="h-8 w-8 text-foreground sm:h-10 sm:w-10" strokeWidth={1.5} />
          </div>

          <div className="mb-8 w-full max-w-2xl space-y-3 px-0 text-center">
            <h1 className="font-heading text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {tDna("scrapeHeroTitle")}
            </h1>
            <p className="mx-auto max-w-[min(36rem,100%)] text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {tDna("scrapeHeroDescription")}
            </p>
          </div>

          <form
            action={formAction}
            className="w-full max-w-lg min-w-0 shrink-0 space-y-4"
            onSubmit={(event) => {
              const rawUrl = new FormData(event.currentTarget).get("url");
              if (typeof rawUrl === "string") setSubmittedUrl(rawUrl.trim());
            }}
          >
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 shadow-sm transition-all focus-within:border-foreground/20 focus-within:ring-2 focus-within:ring-ring/40 focus-within:shadow-md">
              <Globe className="size-5 shrink-0 text-muted-foreground/60" aria-hidden />
              <Input
                name="url"
                type="text"
                placeholder={tDna("scrapeUrlInputPlaceholder")}
                required
                disabled={scrapePending}
                className="h-14 border-0 bg-transparent text-base shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0 sm:text-lg"
              />
            </label>
            <Button
              type="submit"
              disabled={scrapePending}
              size="lg"
              className="flex h-13 w-full rounded-xl px-8 text-base font-semibold sm:h-14"
            >
              {scrapePending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {tDna("scrapeLabel")}…
                </>
              ) : (
                tDna("scrapeLabel")
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-5 flex w-full max-w-lg shrink-0 gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3.5 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
