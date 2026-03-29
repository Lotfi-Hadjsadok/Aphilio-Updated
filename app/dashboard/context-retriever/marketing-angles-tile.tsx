"use client";

import { useTranslations } from "next-intl";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { BentoTile } from "./bento-tile";

const marketingAngleAccents = [
  {
    badge: "bg-accent-gradient text-white shadow-sm ring-1 ring-white/20",
    card: "border-cyan-500/15 hover:border-cyan-500/30",
    bar: "from-cyan-500/90 to-sky-600/90",
  },
  {
    badge: "bg-accent-gradient text-white shadow-sm ring-1 ring-white/20",
    card: "border-fuchsia-500/15 hover:border-fuchsia-500/30",
    bar: "from-fuchsia-500/90 to-pink-600/90",
  },
  {
    badge: "bg-accent-gradient text-white shadow-sm ring-1 ring-white/20",
    card: "border-violet-500/15 hover:border-violet-500/30",
    bar: "from-violet-500/90 to-indigo-600/90",
  },
] as const;

export function MarketingAnglesTile({
  angles,
}: {
  angles: string[] | null;
}) {
  const tCtx = useTranslations("dna.contextResult");
  const visibleAngles = angles ?? [];

  if (visibleAngles.length === 0) return null;

  return (
    <BentoTile
      label={tCtx("marketingAngles")}
      className="col-span-full flex flex-col overflow-hidden"
    >
      <div className="border-b border-border/40 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-fuchsia-500/[0.05]">
        <div className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:pt-6">
          <div className="flex items-center gap-2">
            <Target
              className="size-4 text-muted-foreground/80"
              strokeWidth={1.75}
            />
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
              {tCtx("marketingAngles")}
            </span>
          </div>
          <p className="max-w-xl pb-1 text-xs leading-relaxed text-muted-foreground sm:pb-0 sm:text-right sm:text-sm">
            {tCtx("marketingAnglesHint")}
          </p>
        </div>
        <div className="relative px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
          <div
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible overscroll-x-contain pb-2 pl-0 pr-1 touch-pan-x sm:pr-2 [-ms-overflow-style:none] [scrollbar-width:thin] [scrollbar-color:oklch(0.55_0_0_/0.35)_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/80 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted/30"
          >
            {visibleAngles.map((angle, index) => {
              const accent =
                marketingAngleAccents[index % marketingAngleAccents.length];
              return (
                <article
                  key={index}
                  className={cn(
                    "group/angle snap-start relative flex w-[min(100%,22rem)] shrink-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md sm:w-[min(100%,24rem)]",
                    accent.card,
                  )}
                >
                  <div
                    className={cn(
                      "h-1 w-full bg-gradient-to-r opacity-90",
                      accent.bar,
                    )}
                    aria-hidden
                  />
                  <div className="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "inline-flex size-9 items-center justify-center rounded-xl font-heading text-sm font-bold tabular-nums",
                          accent.badge,
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {tCtx("angle")}
                      </span>
                    </div>
                    <p className="text-base font-medium leading-relaxed text-foreground sm:text-[1.05rem]">
                      {angle}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </BentoTile>
  );
}
