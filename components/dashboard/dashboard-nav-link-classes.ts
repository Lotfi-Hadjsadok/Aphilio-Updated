import { cn } from "@/lib/utils";

/** Use on large cards and links that need the same focus ring as dashboard nav pills. */
export const dashboardNavFocusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Bordered pill used for “Dashboard”, “Library”, and other top-bar dashboard navigation.
 * Matches the dashboard home “Library” control.
 */
export const dashboardNavPillLinkClassName = cn(
  "inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:border-border hover:bg-card/80 hover:text-foreground",
  dashboardNavFocusRingClass,
);
