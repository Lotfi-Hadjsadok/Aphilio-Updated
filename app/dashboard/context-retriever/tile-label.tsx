import type { ComponentType, ReactNode } from "react";

export function TileLabel({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 px-5 pt-5 sm:px-6 sm:pt-6">
      <Icon
        className="size-4 text-muted-foreground/80"
        strokeWidth={1.75}
      />
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
        {children}
      </span>
    </div>
  );
}
