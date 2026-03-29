import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export const voiceTraitAccents = [
  {
    iconWrap: "bg-violet-500/12 text-violet-600 ring-violet-500/25 dark:text-violet-400",
    bar: "bg-violet-500/80",
  },
  {
    iconWrap: "bg-sky-500/12 text-sky-600 ring-sky-500/25 dark:text-sky-400",
    bar: "bg-sky-500/80",
  },
  {
    iconWrap: "bg-amber-500/12 text-amber-600 ring-amber-500/25 dark:text-amber-400",
    bar: "bg-amber-500/80",
  },
  {
    iconWrap: "bg-emerald-500/12 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400",
    bar: "bg-emerald-500/80",
  },
  {
    iconWrap: "bg-rose-500/12 text-rose-600 ring-rose-500/25 dark:text-rose-400",
    bar: "bg-rose-500/80",
  },
] as const;

export function TraitPill({
  icon: Icon,
  label,
  value,
  accentIndex,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  accentIndex: number;
}) {
  const accent = voiceTraitAccents[accentIndex % voiceTraitAccents.length];
  return (
    <div className="group/trait relative flex overflow-hidden rounded-2xl border border-border/70 bg-background/90 shadow-sm transition-shadow hover:shadow-md">
      <span
        className={cn("w-1 shrink-0 rounded-l-2xl", accent.bar)}
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 items-start gap-3 px-4 py-4 sm:gap-3.5 sm:px-5 sm:py-4">
        <span
          className={cn(
            "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1",
            accent.iconWrap,
          )}
        >
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 line-clamp-2 text-[1.05rem] font-medium capitalize leading-snug tracking-tight text-foreground sm:text-lg">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
