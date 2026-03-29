import { cn } from "@/lib/utils";

export const TOTAL_STEPS = 4;

export type AdStudioJourneyStepIndex = 1 | 2 | 3 | 4;

/** Journey nodes — `var(--accent-gradient)` via `bg-accent-gradient`. */
export const adStudioJourneyNodeCompleteCn = cn(
  "border-0 bg-accent-gradient text-white shadow-sm ring-2 ring-white/25 brightness-[0.98]",
);

export const adStudioJourneyNodeCurrentCn = cn(
  "border-0 bg-accent-gradient text-white shadow-md ring-2 ring-white/40",
);

export const adStudioJourneyNodeIdleCn =
  "border border-border/80 bg-muted/50 text-muted-foreground";

/** Completed segment between steps — full brand gradient. */
export const adStudioJourneyConnectorCompleteCn = cn("bg-accent-gradient opacity-95");

/** “Step n/4” chip — gradient fill (brand). */
export const adStudioStepLabelPillCn = cn(
  "bg-accent-gradient text-white shadow-sm ring-1 ring-white/25",
);

/** Subtle gradient wash for selected cards (overlay + content stays readable). */
export const adStudioCardGradientWashCn =
  "pointer-events-none absolute inset-0 bg-accent-gradient opacity-[0.14] dark:opacity-[0.18]";

/** Angle step — slightly stronger wash so picks read clearly. */
export const adStudioAngleCardGradientWashCn =
  "pointer-events-none absolute inset-0 bg-accent-gradient opacity-[0.18] dark:opacity-[0.22]";

/** Primary CTAs — default `Button` variant already uses `bg-accent-gradient` (brand). */
export const adStudioPrimaryButtonCn = cn("shadow-md hover:shadow-lg");

export const studioMaxWidthClass = "max-w-4xl";

export const studioShellCn = "flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden";

export const studioScrollCn = cn(
  "min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain scroll-smooth",
  "[-webkit-overflow-scrolling:touch]",
);

export const studioContentCn = cn("mx-auto w-full min-w-0 px-4 sm:px-6", studioMaxWidthClass);

export const studioFooterBarCn = cn(
  "shrink-0 border-t border-border/50 bg-background/95 py-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/75",
);

/** Grouped “Layouts” category block — depth without heavy borders. */
export const adStudioCategoryShellCn = cn(
  "overflow-hidden rounded-2xl border border-border/45 bg-gradient-to-b from-card/90 via-card/50 to-muted/15 shadow-sm ring-1 ring-border/25",
);
