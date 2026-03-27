"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function AngleCard({
  angle,
  index,
  selected,
  onToggle,
}: {
  angle: string;
  index: number;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
        selected
          ? "border-foreground/30 bg-muted/30 ring-2 ring-foreground/15"
          : "border-border/60 bg-background/40 hover:border-border hover:bg-background/80",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded text-[0.6rem] font-bold transition-all",
          selected
            ? "bg-foreground text-background"
            : "border border-border/60 text-muted-foreground group-hover:border-foreground/30",
        )}
      >
        {selected ? <Check className="size-3" strokeWidth={3} /> : index + 1}
      </span>
      <span className="flex-1 text-sm leading-relaxed text-foreground">{angle}</span>
    </button>
  );
}
