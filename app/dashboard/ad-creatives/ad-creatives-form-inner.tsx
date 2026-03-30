"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { Menu, PenSquare, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  deleteAdCreativeStudioSessionAction,
  listAdCreativeStudioSessionsAction,
  type AdStudioResumePayload,
  type AdStudioSessionListItem,
  type DeleteAdStudioSessionState,
  type ListAdStudioSessionsState,
} from "@/app/actions/ad-creative-studio-sessions";
import type { SavedContextSummary } from "@/types/scrape";
import type { LoadAdCreativesDnaState } from "@/types/ad-creatives";
import { Button } from "@/components/ui/button";
import { DashboardBackIcon } from "@/components/dashboard-back-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";
import {
  dashboardToolHeaderActionsClass,
  dashboardToolHeaderBarClass,
  dashboardToolHeaderPrimaryClass,
  dashboardToolHeaderRowClass,
} from "@/lib/dashboard-tool-layout";
import { NoDnaState } from "./no-dna-state";
import { ErrorBanner } from "./error-banner";
import { AdStudioHistorySidebar } from "./ad-studio-history-sidebar";
import { AdCreativesBrandStudioBody } from "./ad-creatives-brand-studio-body";

const initialHistoryState: ListAdStudioSessionsState = { status: "idle" };
const initialDeleteStudioState: DeleteAdStudioSessionState = { status: "idle" };

export function AdCreativesFormInner({
  savedContexts,
  initialStudioSessions,
  initialContextId,
  initialLoadState,
  resumePayload,
  resumeLoadError,
  currentLocale,
  onChangeDnaRequest,
  onOpenSession,
}: {
  savedContexts: SavedContextSummary[];
  initialStudioSessions: AdStudioSessionListItem[];
  initialContextId?: string;
  initialLoadState?: LoadAdCreativesDnaState;
  resumePayload: AdStudioResumePayload | null;
  resumeLoadError: string | null;
  currentLocale: string;
  onChangeDnaRequest: () => void;
  onOpenSession: (studioSessionId: string) => void;
}) {
  const t = useTranslations("adCreatives");
  const tCommon = useTranslations("common");
  const [brandFlowGeneration, setBrandFlowGeneration] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<AdStudioSessionListItem[]>(initialStudioSessions);

  const [historyState, historyAction, historyPending] = useActionState(
    listAdCreativeStudioSessionsAction,
    initialHistoryState,
  );

  const [deleteState, deleteSessionAction, deletePending] = useActionState(
    deleteAdCreativeStudioSessionAction,
    initialDeleteStudioState,
  );

  const lastHandledDeletedSessionId = useRef<string | null>(null);

  useEffect(() => {
    setSessions(initialStudioSessions);
  }, [initialStudioSessions]);

  useEffect(() => {
    if (historyState.status === "success") {
      setSessions(historyState.items);
    }
  }, [historyState]);

  const hasLibrary = savedContexts.length > 0;
  const historyError = historyState.status === "error" ? historyState.message : null;

  const isFirstBrandFlow = brandFlowGeneration === 0;
  const effectiveInitialLoadState = isFirstBrandFlow ? initialLoadState : undefined;
  const effectiveInitialContextId = isFirstBrandFlow ? initialContextId : undefined;
  const effectiveResumePayload = isFirstBrandFlow ? resumePayload : null;

  const [flowChrome, setFlowChrome] = useState(() => {
    const ready =
      initialLoadState?.status === "ready" ? initialLoadState.payload : null;
    return {
      hasReadyBrand: Boolean(ready),
      activeStudioSessionId: resumePayload?.sessionId ?? ready?.studioSessionId ?? null,
    };
  });

  const reportFlowChrome = useCallback(
    (meta: { hasReadyBrand: boolean; activeStudioSessionId: string | null }) => {
      setFlowChrome((previous) => {
        if (
          previous.hasReadyBrand === meta.hasReadyBrand &&
          previous.activeStudioSessionId === meta.activeStudioSessionId
        ) {
          return previous;
        }
        return meta;
      });
    },
    [],
  );

  function handleReturnToBrandPicker() {
    onChangeDnaRequest();
    setFlowChrome({ hasReadyBrand: false, activeStudioSessionId: null });
    setBrandFlowGeneration((generation) => generation + 1);
  }

  const { hasReadyBrand, activeStudioSessionId } = flowChrome;

  useEffect(() => {
    if (deleteState.status !== "success") return;
    const deletedSessionId = deleteState.deletedSessionId;
    if (lastHandledDeletedSessionId.current === deletedSessionId) return;
    lastHandledDeletedSessionId.current = deletedSessionId;

    setSessions((previous) => previous.filter((session) => session.id !== deletedSessionId));

    if (activeStudioSessionId === deletedSessionId) {
      onChangeDnaRequest();
      setFlowChrome({ hasReadyBrand: false, activeStudioSessionId: null });
      setBrandFlowGeneration((generation) => generation + 1);
    }
  }, [deleteState, activeStudioSessionId, onChangeDnaRequest]);

  function handleNewSession() {
    handleReturnToBrandPicker();
    setSidebarOpen(false);
  }

  function handleSelectSession(studioSessionId: string) {
    onOpenSession(studioSessionId);
    setSidebarOpen(false);
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-row overflow-hidden">
      {hasLibrary ? (
        <AdStudioHistorySidebar
          sessions={sessions}
          activeSessionId={activeStudioSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          historyAction={historyAction}
          historyPending={historyPending}
          historyError={historyError}
          deleteSessionAction={deleteSessionAction}
          deletePending={deletePending}
          deleteState={deleteState}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="ad-studio-shell-bg flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className={dashboardToolHeaderBarClass}>
          <div
            className={cn(
              dashboardToolHeaderRowClass,
              "gap-2 py-2.5 md:gap-4 md:py-4",
            )}
          >
            <div className={dashboardToolHeaderPrimaryClass}>
              {hasLibrary ? (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground md:hidden"
                  aria-label={tCommon("openSessionHistory")}
                >
                  <Menu className="size-4" />
                </button>
              ) : null}
              <DashboardBackIcon
                ariaLabel={tCommon("backToDashboard")}
                title={tCommon("back")}
              />
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent-gradient text-white shadow-sm ring-1 ring-white/30 sm:size-8">
                  <Sparkles className="size-3.5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-sm font-semibold tracking-tight text-foreground">
                    {t("studioTitle")}
                  </p>
                  <p className="hidden text-[0.68rem] leading-snug text-muted-foreground sm:block">
                    {t("studioSubtitle")}
                  </p>
                </div>
              </div>
            </div>
            <div className={dashboardToolHeaderActionsClass}>
              <LanguageSwitcher
                currentLocale={currentLocale}
                className="max-w-[min(11rem,46vw)] sm:max-w-[13rem]"
              />
              <LogoutButton className="h-8 px-2.5 text-xs" />
              {hasLibrary ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 rounded-lg border-border/60 bg-background/50 px-2.5 text-xs md:hidden"
                  onClick={handleNewSession}
                >
                  <PenSquare className="mr-1 size-3.5" />
                  {tCommon("new")}
                </Button>
              ) : null}
              {hasReadyBrand ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 rounded-lg border-border/60 bg-background/50 px-2.5 text-xs"
                  onClick={handleReturnToBrandPicker}
                >
                  {t("switchBrand")}
                </Button>
              ) : null}
            </div>
          </div>
        </header>

        {resumeLoadError ? (
          <div className="shrink-0 px-4 pt-3 sm:px-6">
            <ErrorBanner message={resumeLoadError} />
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {!hasLibrary ? (
            <NoDnaState />
          ) : (
            <AdCreativesBrandStudioBody
              key={brandFlowGeneration}
              savedContexts={savedContexts}
              initialLoadState={effectiveInitialLoadState}
              initialContextId={effectiveInitialContextId}
              resumePayload={effectiveResumePayload}
              onReturnToBrandPicker={handleReturnToBrandPicker}
              onFlowChrome={reportFlowChrome}
            />
          )}
        </div>
      </div>
    </div>
  );
}
