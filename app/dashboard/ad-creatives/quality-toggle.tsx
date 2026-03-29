"use client";

import { Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdImageGenerationMode } from "@/types/ad-creatives";

export function QualityToggle({
  mode,
  onChange,
  qualityLabel,
  fastLabel,
  premiumLabel,
}: {
  mode: AdImageGenerationMode;
  onChange: (mode: AdImageGenerationMode) => void;
  qualityLabel: string;
  fastLabel: string;
  premiumLabel: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">{qualityLabel}</span>
      <div className="flex rounded-lg border border-border/60 bg-muted/30 p-0.5">
        <button
          type="button"
          onClick={() => onChange("fast")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
            mode === "fast"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Zap className="size-3 shrink-0 text-amber-500" aria-hidden />
          {fastLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange("premium")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
            mode === "premium"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Sparkles className="size-3 shrink-0 text-primary" aria-hidden />
          {premiumLabel}
        </button>
      </div>
    </div>
  );
}
