"use client";

import Image from "next/image";
import { Loader2, PenSquare, Search, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { dashboardNavPillLinkClassName } from "@/components/dashboard-back-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type {
  AdStudioSessionListItem,
  DeleteAdStudioSessionState,
} from "@/app/actions/ad-creative-studio-sessions";
import { shortBrandLabelForUi } from "@/lib/ad-studio-brand-label";
import { groupStudioSessionsByRecency } from "./lib/group-studio-sessions";
import { StudioSessionUpdatedLabel } from "./studio-session-updated-label";
import { DeleteStudioSessionDialog } from "./delete-studio-session-dialog";

type AdStudioHistorySidebarProps = {
  sessions: AdStudioSessionListItem[];
  activeSessionId: string | null;
  onSelectSession: (studioSessionId: string) => void;
  onNewSession: () => void;
  historyAction: (formData: FormData) => void;
  historyPending: boolean;
  historyError: string | null;
  deleteSessionAction: (formData: FormData) => void;
  deletePending: boolean;
  deleteState: DeleteAdStudioSessionState;
  isOpen: boolean;
  onClose: () => void;
};

export function AdStudioHistorySidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  historyAction,
  historyPending,
  historyError,
  deleteSessionAction,
  deletePending,
  deleteState,
  isOpen,
  onClose,
}: AdStudioHistorySidebarProps) {
  const tHistory = useTranslations("adCreatives.history");
  const tCommon = useTranslations("common");
  const grouped = groupStudioSessionsByRecency(sessions, {
    today: tHistory("groupToday"),
    yesterday: tHistory("groupYesterday"),
    thisWeek: tHistory("groupThisWeek"),
    older: tHistory("groupOlder"),
  });

  const content = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex justify-end gap-2 px-3 pb-2 pt-3">
        <button
          type="button"
          onClick={onNewSession}
          className={cn(
            dashboardNavPillLinkClassName,
            "px-2.5 py-1.5 text-xs text-foreground hover:text-foreground",
          )}
          title={tHistory("newSessionTitle")}
        >
          <PenSquare className="size-3 shrink-0" />
          {tCommon("new")}
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 pb-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/12 ring-1 ring-border/70">
          <Sparkles className="size-3 text-primary" strokeWidth={1.75} aria-hidden />
        </div>
        <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
          {tHistory("sidebarTitle")}
        </span>
      </div>

      <div className="mx-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <form action={historyAction} className="shrink-0 space-y-1 px-3 py-2">
        <div className="flex gap-1.5">
          <Input
            name="query"
            placeholder={tHistory("searchPlaceholder")}
            className="h-8 flex-1 rounded-lg border-border/70 bg-background/40 px-2.5 text-xs shadow-sm"
            aria-label={tHistory("searchStudioAria")}
          />
          <Button
            type="submit"
            size="icon"
            variant="secondary"
            className="h-8 w-8 shrink-0 rounded-lg"
            disabled={historyPending}
            aria-label={tCommon("search")}
          >
            {historyPending ? (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            ) : (
              <Search className="size-3.5" />
            )}
          </Button>
        </div>
        {historyError ? (
          <p className="text-[0.65rem] leading-snug text-destructive">{historyError}</p>
        ) : null}
      </form>
      {deleteState.status === "error" ? (
        <p className="px-3 pb-1 text-[0.65rem] leading-snug text-destructive">
          {deleteState.message}
        </p>
      ) : null}

      <ScrollArea className="min-h-0 flex-1 py-1">
        {grouped.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs leading-relaxed text-muted-foreground">
            {tHistory("noSessions")}
            <br />
            <span className="text-foreground/80">{tHistory("pickBrandToStart")}</span>
          </p>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="mb-1.5">
              <p className="px-3 pb-0.5 pt-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((item) => {
                const sessionTitleShort = shortBrandLabelForUi(item.title);
                const contextLabelShort = shortBrandLabelForUi(item.contextNameCache);
                const showContextLine =
                  contextLabelShort.length > 0 && contextLabelShort !== sessionTitleShort;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "group mx-1.5 flex w-[calc(100%-0.75rem)] items-center gap-0.5 rounded-lg transition-colors",
                      activeSessionId === item.id
                        ? "bg-muted/90 shadow-sm ring-1 ring-border/60"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectSession(item.id)}
                      className="flex min-w-0 flex-1 gap-2 rounded-md px-2 py-1.5 text-left"
                    >
                      <div className="relative size-9 shrink-0 overflow-hidden rounded-md bg-muted/40 ring-1 ring-border/40">
                        {item.previewImageUrl ? (
                          <Image
                            unoptimized
                            src={item.previewImageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center px-0.5 text-center text-[0.55rem] font-medium leading-none text-muted-foreground">
                            {tHistory("draft")}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium leading-tight text-foreground">
                          {sessionTitleShort}
                        </p>
                        {showContextLine ? (
                          <p className="truncate text-[0.65rem] leading-tight text-muted-foreground">
                            {contextLabelShort}
                          </p>
                        ) : null}
                        <p className="mt-0.5 text-[0.6rem] tabular-nums leading-tight text-muted-foreground">
                          {tHistory("stepProgress", { current: item.furthestStep })} ·{" "}
                          <StudioSessionUpdatedLabel updatedAt={item.updatedAt} />
                        </p>
                      </div>
                    </button>
                    <div className="shrink-0 pr-1">
                      <DeleteStudioSessionDialog
                        sessionId={item.id}
                        sessionTitle={item.title}
                        deleteSessionAction={deleteSessionAction}
                        deletePending={deletePending}
                        deleteState={deleteState}
                        showTrashAlways={activeSessionId === item.id}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );

  return (
    <>
      <aside className="hidden h-full min-h-0 w-56 shrink-0 border-r border-border/50 bg-card/30 backdrop-blur-xl md:flex md:flex-col lg:w-60">
        {content}
      </aside>

      {isOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex h-full min-h-0 w-[min(100%,17rem)] max-w-[82vw] flex-col border-r border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-2 top-2.5 z-10 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
              aria-label={tHistory("closeHistoryAria")}
            >
              <X className="size-3.5" />
            </button>
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}
