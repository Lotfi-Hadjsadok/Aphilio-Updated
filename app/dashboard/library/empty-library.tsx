import { LayoutTemplate } from "lucide-react";

export function EmptyLibrary() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/10 px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-gradient-subtle ring-1 ring-border">
        <LayoutTemplate className="size-6 text-foreground" strokeWidth={1.5} />
      </div>
      <div className="max-w-xs space-y-1.5">
        <p className="font-heading text-base font-semibold text-foreground">No creatives yet</p>
        <p className="text-sm text-muted-foreground">
          Generate ad images from the Ad Creatives tool — they&apos;ll appear here automatically.
        </p>
      </div>
    </div>
  );
}
