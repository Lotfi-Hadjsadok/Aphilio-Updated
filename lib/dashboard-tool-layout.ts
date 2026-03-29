import { cn } from "@/lib/utils";

/**
 * Top bar for dashboard tools (Ad studio, Brand DNA, DNA result) so back actions
 * and titles share one horizontal track and safe-area padding.
 */
export const dashboardToolHeaderBarClass = cn(
  "shrink-0 border-b border-border/40 bg-gradient-to-r from-card/80 via-card/50 to-card/30 backdrop-blur-xl",
  "pt-[env(safe-area-inset-top)]",
);

/** Horizontal inset for tool shells (header + main) so edges line up. */
export const dashboardToolPageGutterClass = cn(
  "pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]",
  "sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]",
);

/**
 * Full-width row: back + title flush left, actions flush right (`justify-between`).
 */
export const dashboardToolHeaderRowClass = cn(
  "flex w-full min-w-0 flex-wrap items-center justify-between gap-3 py-3.5 sm:gap-4 sm:py-4",
  dashboardToolPageGutterClass,
);
