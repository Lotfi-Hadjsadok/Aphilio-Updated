/**
 * Shared surface styles for dashboard settings — aligned with Aphilio brand
 * (cool gray bases, subtle blur, gradient accents on chrome only).
 */
export const settingsCardClassName =
  "relative overflow-hidden rounded-2xl border border-border/60 bg-card/85 shadow-sm ring-1 ring-border/40 backdrop-blur-sm dark:bg-card/70";

/** Single flat track — no extra border, ring, or blur (avoids “pill in pill” chrome). */
export const settingsTabShellClassName =
  "relative rounded-xl bg-muted/50 p-1 dark:bg-muted/35";

/** List sits inside the track; transparent so the shell color shows in the gaps. */
export const settingsTabsListClassName =
  "relative z-10 grid h-auto min-h-0 w-full grid-cols-2 gap-1 bg-transparent p-0 sm:grid-cols-4";

/**
 * Settings tab triggers: flat active surface (card/background), no rings or gradient bars.
 */
export const settingsTabsTriggerClassName =
  "flex min-h-[3.75rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-center text-[0.7rem] font-medium leading-snug text-muted-foreground transition-colors duration-150 ease-out " +
  "hover:text-foreground sm:min-h-9 sm:flex-row sm:gap-2 sm:px-2.5 sm:text-left sm:text-sm sm:leading-normal " +
  "border-transparent data-active:border-transparent data-active:bg-background data-active:font-semibold data-active:text-foreground data-active:shadow-sm " +
  "dark:data-active:border-transparent dark:data-active:bg-card " +
  "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:opacity-70 data-active:[&_svg]:opacity-100";

export const settingsInsetSurfaceClassName =
  "rounded-xl border border-border/60 bg-muted/25 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)] dark:bg-muted/20 dark:shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)]";
