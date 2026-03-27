import { cn } from "@/lib/utils";

export function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-1 rounded-full transition-all",
            index + 1 === current
              ? "w-5 bg-foreground"
              : index + 1 < current
                ? "w-2.5 bg-foreground/40"
                : "w-2.5 bg-border",
          )}
        />
      ))}
    </div>
  );
}
