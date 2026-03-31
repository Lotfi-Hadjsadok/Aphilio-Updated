import type { ReactNode } from "react";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { dashboardNavFocusRingClass } from "@/components/dashboard/dashboard-nav-link-classes";
import { cn } from "@/lib/utils";

export type LockedToolCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  unlockHref: string;
  activatePlanLabel: string;
  unlockAriaLabel: string;
};

export function LockedToolCard({
  title,
  description,
  icon,
  unlockHref,
  activatePlanLabel,
  unlockAriaLabel,
}: LockedToolCardProps) {
  return (
    <Link
      href={unlockHref}
      className={cn("group block h-full", dashboardNavFocusRingClass)}
      aria-label={unlockAriaLabel}
    >
      <div className="dashboard-tool-card relative flex h-full flex-col overflow-hidden">
        <div className="relative flex h-full flex-col gap-4 p-5 opacity-50 blur-[0.5px] transition-all duration-300 group-hover:opacity-30 group-hover:blur-[1px] sm:p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient-subtle shadow-inner ring-1 ring-border/80">
            {icon}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {title}
            </p>
            <p className="text-[0.8rem] leading-relaxed text-muted-foreground sm:text-sm">
              {description}
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 transition-all duration-300">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/70 ring-1 ring-border/60 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-background/90 group-hover:ring-border">
            <Lock
              className="size-5 text-muted-foreground transition-colors duration-300 group-hover:text-foreground"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>

          <div className="translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-border/60 backdrop-blur-sm">
              <Sparkles className="size-3 text-amber-400" aria-hidden />
              {activatePlanLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
