"use client";

import type { RefObject } from "react";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { DashboardBackIcon } from "@/components/dashboard-back-link";
import {
  dashboardToolHeaderBarClass,
  dashboardToolHeaderRowClass,
} from "@/lib/dashboard-tool-layout";
import { cn } from "@/lib/utils";
import type { SavedContextSummary } from "@/types/scrape";
import { LogoutButton } from "@/components/logout-button";
import { LibrarySection, brandDnaLibraryWrapperClassName } from "./library-section";

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
  const hasLibrary = savedContexts.length > 0;

  return (
    <header className={cn(dashboardToolHeaderBarClass, "relative z-20")}>
      <div className={cn(dashboardToolHeaderRowClass, "overflow-visible")}>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <DashboardBackIcon
            ariaLabel={tCommon("backToDashboard")}
            title={tCommon("back")}
          />
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-gradient-subtle shadow-inner ring-1 ring-border/80">
              <Globe className="size-4 text-foreground" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {tTool("title")}
              </p>
              <p className="text-xs leading-snug text-muted-foreground sm:text-[0.8125rem]">
                {tTool("description")}
              </p>
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          {hasLibrary ? (
            <LibrarySection
              ref={libraryPanelRef}
              savedContexts={savedContexts}
              deleteFormAction={deleteFormAction}
              deletePending={deletePending}
              expanded={expanded}
              onExpandedChange={onExpandedChange}
              wrapperClassName={brandDnaLibraryWrapperClassName(expanded)}
              onNavigate={() => {}}
            />
          ) : null}
          <LogoutButton className="h-8 px-2.5 text-xs" />
        </div>
      </div>
    </header>
  );
}
