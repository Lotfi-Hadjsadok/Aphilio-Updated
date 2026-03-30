import { cn } from "@/lib/utils";

/**
 * Top bar for dashboard tools (Ad studio, Brand DNA, DNA result) so back actions
 * and titles share one horizontal track and safe-area padding.
 */
export const dashboardToolHeaderBarClass = cn(
  "shrink-0 overflow-x-hidden border-b border-border/40 bg-gradient-to-r from-card/80 via-card/50 to-card/30 backdrop-blur-xl",
  "pt-[env(safe-area-inset-top)]",
);

/** Horizontal inset for tool shells (header + main) so edges line up. */
export const dashboardToolPageGutterClass = cn(
  "pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]",
  "sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]",
);

/**
 * Full-width row: back + title flush left, actions flush right (`justify-between`).
 * Below `md`, stacks into two rows so controls never force horizontal scrolling.
 */
export const dashboardToolHeaderRowClass = cn(
  "flex w-full min-w-0 flex-col gap-2 overflow-x-hidden py-3.5 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4 md:py-4",
  dashboardToolPageGutterClass,
);

/** Primary block (back + title) in a tool header row — full width when stacked. */
export const dashboardToolHeaderPrimaryClass =
  "flex w-full min-w-0 items-center gap-2 sm:gap-3 md:flex-1 md:min-w-0";

/** Actions block (language, logout, etc.) — full width row when stacked, auto width in toolbar row. */
export const dashboardToolHeaderActionsClass =
  "flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 md:w-auto md:shrink-0 sm:gap-2";
