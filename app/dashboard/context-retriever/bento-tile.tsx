import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BentoTile({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "group/tile relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
      aria-label={label}
    >
      {children}
    </div>
  );
}
