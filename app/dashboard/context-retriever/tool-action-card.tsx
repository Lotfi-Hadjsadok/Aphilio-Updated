import type { ComponentType } from "react";
import Link from "next/link";
import { ChevronRight, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToolActionCard({
  href,
  icon: Icon,
  title,
  primary: isPrimary,
  iconAnimationDelaySeconds,
}: {
  href: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  primary?: boolean;
  iconAnimationDelaySeconds?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "dashboard-tool-card group/dna-tool relative flex flex-1 items-center gap-3 overflow-hidden rounded-xl px-4 py-3",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <span
        className="animate-dna-tool-shimmer pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-r from-fuchsia-500/10 via-transparent to-cyan-500/10 opacity-0 transition-opacity duration-300 group-hover/dna-tool:opacity-100"
        aria-hidden
      />
      <span
        className={cn(
          "relative flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
          isPrimary
            ? "bg-accent-gradient ring-white/20"
            : "bg-muted/70 ring-border/60",
        )}
      >
        <span
          className="flex items-center justify-center animate-dna-tool-bob"
          style={{ animationDelay: `${iconAnimationDelaySeconds ?? 0}s` }}
        >
          <Icon
            className={cn(
              "size-4",
              isPrimary ? "text-white drop-shadow-sm" : "text-foreground",
            )}
            strokeWidth={2}
          />
        </span>
      </span>
      <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
        {title}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover/dna-tool:translate-x-0.5 group-hover/dna-tool:text-muted-foreground" />
    </Link>
  );
}

export function LockedToolActionCard({
  icon: Icon,
  title,
  primary: isPrimary,
  iconAnimationDelaySeconds,
  checkoutSlug = "monthly",
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  primary?: boolean;
  iconAnimationDelaySeconds?: number;
  checkoutSlug?: string;
}) {
  return (
    <a
      href={`/api/checkout/start?slug=${checkoutSlug}`}
      className={cn(
        "dashboard-tool-card group/dna-tool relative flex flex-1 items-center gap-3 overflow-hidden rounded-xl px-4 py-3.5",
        "ring-1 ring-transparent transition-[box-shadow,ring-color] duration-300",
        "hover:shadow-[0_8px_30px_-12px_rgba(245,158,11,0.22)] hover:ring-amber-500/20",
        "dark:hover:shadow-[0_8px_32px_-12px_rgba(251,191,36,0.12)] dark:hover:ring-amber-400/15",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      aria-label={`Activate plan to unlock ${title}`}
    >
      <span
        className="animate-dna-tool-shimmer pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-r from-fuchsia-500/10 via-transparent to-cyan-500/10 opacity-0 transition-opacity duration-300 group-hover/dna-tool:opacity-100"
        aria-hidden
      />
      {/* Soft “locked” veil — no text blur */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-r from-background/[0.02] via-transparent to-amber-500/[0.06] dark:to-amber-400/[0.05]"
        aria-hidden
      />

      <div className="relative z-[1] flex min-h-[2.75rem] w-full flex-1 items-center gap-3">
        <span
          className={cn(
            "relative flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-[opacity,filter] duration-300",
            isPrimary
              ? "bg-accent-gradient ring-white/20"
              : "bg-muted/70 ring-border/60",
            "opacity-[0.62] group-hover/dna-tool:opacity-[0.88]",
          )}
        >
          <span
            className="flex items-center justify-center animate-dna-tool-bob"
            style={{ animationDelay: `${iconAnimationDelaySeconds ?? 0}s` }}
          >
            <Icon
              className={cn(
                "size-4 transition-[filter] duration-300 group-hover/dna-tool:brightness-110",
                isPrimary ? "text-white drop-shadow-sm" : "text-foreground",
              )}
              strokeWidth={2}
            />
          </span>
        </span>

        <span className="min-w-0 flex-1 text-sm font-semibold text-foreground/68 transition-colors duration-300 group-hover/dna-tool:text-foreground/90">
          {title}
        </span>

        {/* Lock column — jewel badge + micro-CTA (in flow so overflow-hidden does not clip) */}
        <div className="relative flex shrink-0 flex-col items-center justify-center gap-1">
          <span
            className={cn(
              "relative flex size-10 items-center justify-center rounded-2xl",
              "bg-gradient-to-b from-amber-400/25 via-amber-500/12 to-amber-600/8",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_2px_8px_-2px_rgba(180,83,9,0.35)]",
              "ring-1 ring-amber-500/45 ring-inset",
              "transition-[transform,box-shadow,background-image] duration-300 ease-out",
              "group-hover/dna-tool:scale-[1.06] group-hover/dna-tool:from-amber-400/38 group-hover/dna-tool:via-amber-500/20 group-hover/dna-tool:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_14px_-3px_rgba(217,119,6,0.45)]",
              "dark:from-amber-400/18 dark:via-amber-500/10 dark:to-amber-950/40",
              "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_12px_-2px_rgba(251,191,36,0.15)]",
              "dark:ring-amber-400/40",
              "dark:group-hover/dna-tool:ring-amber-300/50",
            )}
            aria-hidden
          >
            {/* Inner gloss arc */}
            <span
              className="pointer-events-none absolute inset-x-1 top-0.5 h-[42%] rounded-t-[0.65rem] bg-gradient-to-b from-white/35 to-transparent opacity-70 dark:from-white/12 dark:opacity-100"
              aria-hidden
            />
            <Lock
              className="relative z-[1] size-[1.125rem] text-amber-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.35)] dark:text-amber-100 dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
              strokeWidth={2.35}
              aria-hidden
            />
          </span>
          <span
            className={cn(
              "inline-flex max-w-[5.5rem] flex-wrap items-center justify-center gap-0.5 text-center",
              "text-[0.58rem] font-semibold leading-tight tracking-wide text-amber-900/48 transition-colors duration-300",
              "dark:text-amber-200/42",
              "group-hover/dna-tool:text-amber-950 group-hover/dna-tool:dark:text-amber-50",
            )}
          >
            <Sparkles
              className="size-2.5 shrink-0 text-amber-500/75 transition-colors duration-300 group-hover/dna-tool:text-amber-600 dark:text-amber-400/75 dark:group-hover/dna-tool:text-amber-300"
              aria-hidden
            />
            <span className="uppercase">Activate plan</span>
          </span>
        </div>
      </div>
    </a>
  );
}
