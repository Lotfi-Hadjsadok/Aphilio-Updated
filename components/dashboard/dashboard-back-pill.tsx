import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { dashboardNavPillLinkClassName } from "@/components/dashboard/dashboard-nav-link-classes";
import { cn } from "@/lib/utils";

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
