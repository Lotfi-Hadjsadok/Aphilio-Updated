"use client";

import type { AdCreativesDnaPayload } from "@/types/ad-creatives";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SectionToggleCard({
  option,
  selected,
  onToggle,
}: {
  option: AdCreativesDnaPayload["sectionOptions"][number];
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors",
        selected
          ? "border-foreground/20 bg-muted/20 ring-1 ring-foreground/10"
          : "border-border/60 bg-background/40 hover:bg-background/70",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="line-clamp-1 text-xs font-semibold text-foreground">{option.heading}</span>
        <Badge variant="outline" className="max-w-[40%] shrink-0 truncate text-[0.6rem]">
          {option.sourceLabel}
        </Badge>
      </div>
      <p className="line-clamp-2 text-[0.65rem] leading-relaxed text-muted-foreground">{option.preview}</p>
    </button>
  );
}
