"use client";

import { Check, Clock, Globe } from "lucide-react";
import type { SavedContextSummary } from "@/types/scrape";
import { cn } from "@/lib/utils";
import { FormattedDate, FORMAT_DATE_SHORT } from "@/components/formatted-date";

export function DnaPickCard({
  savedContext,
  selected,
  onSelect,
}: {
  savedContext: SavedContextSummary;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border bg-background/60 px-3 py-2.5 text-left transition-colors",
        selected
          ? "border-foreground/25 bg-background ring-2 ring-foreground/15"
          : "border-border/60 hover:bg-background/90",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border/60">
        <Globe className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{savedContext.name}</span>
        <span className="mt-0.5 flex items-center gap-1 text-[0.65rem] text-muted-foreground">
          <Clock className="size-2.5 opacity-70" />
          <FormattedDate date={savedContext.createdAt} options={FORMAT_DATE_SHORT} />
        </span>
      </span>
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border border-border/70 transition-opacity",
          selected ? "bg-foreground text-background" : "opacity-0 group-hover:opacity-100",
        )}
        aria-hidden
      >
        <Check className="size-3" />
      </span>
    </button>
  );
}
