import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { dashboardNavFocusRingClass } from "@/components/dashboard/dashboard-nav-link-classes";
import { cn } from "@/lib/utils";

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
