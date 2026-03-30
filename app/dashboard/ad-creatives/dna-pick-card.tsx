"use client";

import { Check } from "lucide-react";
import type { SavedContextSummary } from "@/types/scrape";
import { cn } from "@/lib/utils";
import { dnaPickCardTitleAndSubtitle } from "@/lib/ad-creatives/brand-label";
import { adStudioCardGradientWashCn } from "./ad-creatives-constants";
import { BrandMarkAvatar } from "./brand-mark-avatar";

function cleanHostname(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function DnaPickCard({
  savedContext,
  selected,
  onSelect,
}: {
  savedContext: SavedContextSummary;
  selected: boolean;
  onSelect: () => void;
}) {
  const hostname = cleanHostname(savedContext.baseUrl);
  const { title: titleText, subtitle: subtitleText } = dnaPickCardTitleAndSubtitle(
    savedContext.name,
    hostname,
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex w-full overflow-hidden rounded-2xl border px-3.5 py-3 text-left transition-all duration-200",
        selected
          ? "border-border/60 bg-card/50 shadow-md ring-2 ring-white/15"
          : "border-border/50 bg-card/40 hover:bg-card/70 hover:shadow-sm",
      )}
    >
      {selected ? <span className={adStudioCardGradientWashCn} aria-hidden /> : null}
      <span className="relative z-10 flex w-full items-center gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl p-0.5 ring-1 transition-colors",
            selected
              ? "bg-background/80 text-foreground ring-white/20"
              : "bg-muted/50 text-muted-foreground ring-border/50 group-hover:bg-muted",
          )}
        >
          <BrandMarkAvatar faviconUrl={savedContext.favicon} hostname={savedContext.baseUrl} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-heading text-sm font-semibold text-foreground sm:text-base">
            {titleText}
          </span>
          {subtitleText ? (
            <span className="mt-0.5 block truncate text-[0.68rem] text-muted-foreground/80">
              {subtitleText}
            </span>
          ) : null}
        </span>
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full transition-all",
            selected
              ? "bg-accent-gradient text-white shadow-sm ring-1 ring-white/25"
              : "border border-border/60 opacity-0 group-hover:opacity-70",
          )}
          aria-hidden
        >
          <Check className="size-3.5" strokeWidth={2.5} />
        </span>
      </span>
    </button>
  );
}
