import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
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

type DashboardBackPillProps = {
  href?: string;
  label?: string;
  className?: string;
};

export function DashboardBackPill({
  href = "/dashboard",
  label = "Dashboard",
  className,
}: DashboardBackPillProps) {
  return (
    <Link href={href} className={cn(dashboardNavPillLinkClassName, className)}>
      <ArrowLeft className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
      {label}
    </Link>
  );
}

type DashboardBackIconProps = {
  href?: string;
  className?: string;
  /** Visible and announced name; default fits the main dashboard shortcut. */
  ariaLabel?: string;
  /** Optional hover hint (e.g. shorter label when ariaLabel is verbose). */
  title?: string;
  /** Compact toolbar (DNA result header); default matches scrape / ad studio. */
  density?: "default" | "compact";
};

export function DashboardBackIcon({
  href = "/dashboard",
  className,
  ariaLabel = "Back to dashboard",
  title,
  density = "default",
}: DashboardBackIconProps) {
  const size = density === "compact" ? "icon-sm" : "icon-lg";
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      title={title}
      className={cn(
        buttonVariants({ variant: "outline", size }),
        "shrink-0 rounded-xl border-border/60 bg-card/80 shadow-sm backdrop-blur-md",
        dashboardNavFocusRingClass,
        className,
      )}
    >
      <ArrowLeft className="size-3.5" strokeWidth={1.75} aria-hidden />
    </Link>
  );
}
