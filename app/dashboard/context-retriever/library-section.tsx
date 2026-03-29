"use client";

import { forwardRef } from "react";
import type { RefObject } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, Library } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SavedContextSummary } from "@/types/scrape";
import { LibraryItem } from "./library-item";

export function brandDnaLibraryWrapperClassName(expanded: boolean) {
  return cn(
    "relative z-10 w-full min-w-0 shrink-0 sm:w-[min(22rem,calc(100vw-12rem))]",
    !expanded &&
      "flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-lg backdrop-blur-xl",
  );
}

export const LibrarySection = forwardRef<
  HTMLDivElement,
  {
    savedContexts: SavedContextSummary[];
    deleteFormAction: (formData: FormData) => void | Promise<void>;
    deletePending: boolean;
    wrapperClassName: string;
    onNavigate: () => void;
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
  }
>(function LibrarySection(
  {
    savedContexts,
    deleteFormAction,
    deletePending,
    wrapperClassName,
    onNavigate,
    expanded,
    onExpandedChange,
  },
  ref,
) {
  const tDna = useTranslations("dna");
  const dnaCountLabel =
    savedContexts.length === 1
      ? tDna("savedProfilesTooltipSingular")
      : tDna("savedProfilesTooltipPlural", { count: savedContexts.length });

  const headerRow = (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-border/70">
        <Library className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 basis-[min(100%,10rem)]">
        <p className="text-sm font-semibold text-foreground">{tDna("libraryPanelTitle")}</p>
        <p className="text-[0.65rem] text-muted-foreground">{tDna("libraryPanelSubtitle")}</p>
      </div>
      <span
        className="shrink-0 whitespace-nowrap rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium tabular-nums text-muted-foreground ring-1 ring-border/60"
        title={dnaCountLabel}
      >
        {savedContexts.length === 1
          ? tDna("dnaBadgeSingular")
          : tDna("dnaBadgePlural", { count: savedContexts.length })}
      </span>
    </>
  );

  return (
    <div ref={ref} className={wrapperClassName}>
      {expanded ? (
        <>
          <div className="rounded-2xl border border-border/70 bg-card/90 shadow-lg backdrop-blur-xl">
            <div className="border-b border-border/50 px-4 py-3.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-3">
                {headerRow}
                <button
                  type="button"
                  onClick={() => onExpandedChange(false)}
                  aria-expanded
                  aria-label={tDna("collapseLibraryAria")}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon-sm" }),
                    "shrink-0 rounded-lg border-border/60 bg-background/80",
                  )}
                >
                  <ChevronUp className="size-4 text-muted-foreground" aria-hidden />
                </button>
              </div>
            </div>
          </div>
          <div
            className={cn(
              "absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[min(50vh,22rem)] space-y-1.5 overflow-y-auto overscroll-contain rounded-2xl border border-border/70 bg-card/95 p-3 shadow-lg backdrop-blur-xl",
              "sm:left-auto sm:right-0 sm:w-[min(22rem,calc(100vw-12rem))]",
            )}
          >
            {savedContexts.map((savedContext) => (
              <LibraryItem
                key={savedContext.id}
                savedContext={savedContext}
                deleteFormAction={deleteFormAction}
                deletePending={deletePending}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => onExpandedChange(true)}
          aria-expanded={false}
          aria-label={tDna("expandLibraryAria")}
          className={cn(
            "flex w-full shrink-0 flex-col px-4 py-3.5 text-left outline-none transition-colors",
            "rounded-2xl hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-3">
            {headerRow}
            <span
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" }),
                "pointer-events-none shrink-0 rounded-lg border-border/60 bg-background/80",
              )}
              aria-hidden
            >
              <ChevronDown className="size-4 text-muted-foreground" />
            </span>
          </div>
        </button>
      )}
    </div>
  );
});

LibrarySection.displayName = "LibrarySection";
