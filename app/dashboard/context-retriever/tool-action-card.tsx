import type { ComponentType } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToolActionCard({
  href,
  icon: Icon,
  title,
  primary: isPrimary,
  iconAnimationDelaySeconds,
  className,
}: {
  href: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  primary?: boolean;
  iconAnimationDelaySeconds?: number;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "dashboard-tool-card group/dna-tool relative flex min-h-[3.25rem] flex-1 items-center gap-3.5 overflow-hidden rounded-2xl px-4 py-3.5 sm:min-h-[3.5rem] sm:px-5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <span
        className="animate-dna-tool-shimmer pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-r from-fuchsia-500/10 via-transparent to-cyan-500/10 opacity-0 transition-opacity duration-300 group-hover/dna-tool:opacity-100"
        aria-hidden
      />
      <span
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset sm:size-11",
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
              "size-[1.05rem] sm:size-[1.125rem]",
              isPrimary ? "text-white drop-shadow-sm" : "text-foreground",
            )}
            strokeWidth={2}
          />
        </span>
      </span>
      <span className="min-w-0 flex-1 text-left text-sm font-semibold leading-snug text-foreground sm:text-[0.9375rem]">
        {title}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/35 transition-transform group-hover/dna-tool:translate-x-0.5 group-hover/dna-tool:text-muted-foreground/70" />
    </Link>
  );
}
