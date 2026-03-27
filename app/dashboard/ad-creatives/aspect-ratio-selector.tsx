"use client";

import type { AdAspectRatio } from "@/types/ad-creatives";
import { ASPECT_RATIO_OPTIONS } from "@/lib/ad-creatives-templates";
import { cn } from "@/lib/utils";

export function AspectRatioSelector({
  selected,
  onChange,
}: {
  selected: AdAspectRatio;
  onChange: (ratio: AdAspectRatio) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
        Aspect ratio
      </p>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {ASPECT_RATIO_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 transition-all",
              selected === option.value
                ? "border-foreground/25 bg-muted/25 ring-2 ring-foreground/15"
                : "border-border/60 bg-background/40 hover:border-border hover:bg-background/70",
            )}
          >
            <span
              className={cn(
                "rounded-sm border-2 transition-colors",
                option.wClass,
                option.hClass,
                selected === option.value
                  ? "border-foreground/60 bg-foreground/10"
                  : "border-border bg-muted/30",
              )}
              aria-hidden
            />
            <span className="text-xs font-semibold text-foreground">{option.label}</span>
            <span className="text-[0.6rem] text-muted-foreground">{option.value}</span>
          </button>
        ))}
      </div>
      <p className="text-[0.65rem] text-muted-foreground">
        {ASPECT_RATIO_OPTIONS.find((option) => option.value === selected)?.note}
      </p>
    </div>
  );
}
