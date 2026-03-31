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
