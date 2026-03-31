import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { dashboardNavFocusRingClass } from "@/components/dashboard/dashboard-nav-link-classes";
import { cn } from "@/lib/utils";

export type ToolCardProps = {
  href: string;
  title: string;
  description?: string;
  actionLabel: string;
  icon: ReactNode;
  accent?: string;
};

export function ToolCard({
  href,
  title,
  description,
  actionLabel,
  icon,
  accent,
}: ToolCardProps) {
  return (
    <Link href={href} className={cn("group block h-full", dashboardNavFocusRingClass)}>
      <div className="dashboard-tool-card flex h-full flex-col">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent-gradient opacity-[0.08] blur-3xl transition-opacity duration-500 group-hover:opacity-[0.28]"
          aria-hidden
        />
        <div className="relative flex h-full flex-col gap-4 p-5 sm:p-6">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner ring-1 ring-border/80",
              accent ?? "bg-accent-gradient-subtle",
            )}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {title}
            </p>
            {description ? (
              <p className="text-[0.8rem] leading-relaxed text-muted-foreground sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-gradient">
            {actionLabel}
            <ArrowRight
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </p>
        </div>
      </div>
    </Link>
  );
}
