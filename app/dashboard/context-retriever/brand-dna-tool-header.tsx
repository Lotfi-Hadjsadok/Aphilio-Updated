"use client";

import type { RefObject } from "react";
import { useTranslations } from "next-intl";
import { Globe, Library } from "lucide-react";
import { DashboardBackIcon } from "@/components/dashboard-back-link";
import { dashboardToolHeaderBarClass, dashboardToolPageGutterClass } from "@/lib/dashboard-tool-layout";
import { cn } from "@/lib/utils";
import type { SavedContextSummary } from "@/types/scrape";
import { LogoutButton } from "@/components/logout-button";
import { DnaLibrarySidebar } from "./dna-library-sidebar";
import { Button } from "@/components/ui/button";

export function BrandDnaToolHeader({
  savedContexts,
  deleteFormAction,
  deletePending,
  expanded,
  onExpandedChange,
  libraryPanelRef,
}: {
  savedContexts: SavedContextSummary[];
  deleteFormAction: (formData: FormData) => void | Promise<void>;
  deletePending: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  libraryPanelRef: RefObject<HTMLDivElement | null>;
}) {
  const tTool = useTranslations("dashboard.tools.dna");
  const tCommon = useTranslations("common");
  const tDna = useTranslations("dna");
  const hasLibrary = savedContexts.length > 0;

  const dnaBadgeLabel =
    savedContexts.length === 1
      ? tDna("dnaBadgeSingular")
      : tDna("dnaBadgePlural", { count: savedContexts.length });

  function LibraryTriggerButton() {
    if (!hasLibrary) return null;
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 shrink-0 gap-2 border-border/70 bg-card/80 px-3 text-xs font-medium shadow-sm backdrop-blur-sm"
        onClick={() => onExpandedChange(true)}
        aria-label={tDna("expandLibraryAria")}
      >
        <Library className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        <span className="max-w-[12rem] truncate tabular-nums">{dnaBadgeLabel}</span>
      </Button>
    );
  }

  return (
    <header className={cn(dashboardToolHeaderBarClass, "relative z-20")}>
      <div
        className={cn(
          dashboardToolPageGutterClass,
          "flex min-w-0 items-center justify-between gap-2 overflow-x-hidden py-3.5 sm:gap-3 md:hidden",
        )}
      >
        <DashboardBackIcon
          ariaLabel={tCommon("backToDashboard")}
          title={tCommon("back")}
        />
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <LibraryTriggerButton />
          <LogoutButton className="h-9 shrink-0 px-3 text-xs sm:text-sm" />
        </div>
      </div>

      <div
        className={cn(
          dashboardToolPageGutterClass,
          "hidden min-h-[3.25rem] flex-row items-center justify-between gap-4 py-3 sm:gap-6 sm:py-4 md:flex",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 md:pr-2">
          <DashboardBackIcon
            ariaLabel={tCommon("backToDashboard")}
            title={tCommon("back")}
          />
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-gradient-subtle shadow-inner ring-1 ring-border/80">
            <Globe className="size-4 text-foreground" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-balance text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
              {tTool("title")}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <LibraryTriggerButton />
          <LogoutButton className="h-9 shrink-0 px-3 text-xs sm:text-sm" />
        </div>
      </div>

      {hasLibrary ? (
        <DnaLibrarySidebar
          ref={libraryPanelRef}
          savedContexts={savedContexts}
          deleteFormAction={deleteFormAction}
          deletePending={deletePending}
          expanded={expanded}
          onExpandedChange={onExpandedChange}
        />
      ) : null}
    </header>
  );
}
