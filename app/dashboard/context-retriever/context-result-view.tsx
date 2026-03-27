"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { deleteSavedContext } from "@/app/actions/scrape";
import type { BrandingDNA, BrandingPersonality, DeleteDNAState, ScrapeResult, TypographyEntry } from "@/types/scrape";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  ArrowLeft,
  Library,
  Dna,
  Type,
  Sparkles,
  Palette,
  Images,
  MessageSquare,
  Zap,
  Users,
  Share2,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog } from "@base-ui/react/alert-dialog";
const initialDeleteState: DeleteDNAState = {};

function resolveBrandColors(branding: BrandingDNA): { primary: string | null; secondary: string | null } {
  const colors = branding.colors as unknown;
  if (Array.isArray(colors)) {
    return { primary: colors[0] ?? null, secondary: colors[1] ?? null };
  }
  const colorsObject = colors as { primary?: string | null; secondary?: string | null };
  return { primary: colorsObject.primary ?? null, secondary: colorsObject.secondary ?? null };
}


function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="size-3 text-muted-foreground" strokeWidth={1.75} />
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

function getReadableTextColor(backgroundHex: string): string {
  const normalizedHex = backgroundHex.startsWith("#") ? backgroundHex.slice(1) : backgroundHex;
  const expandedHex =
    normalizedHex.length === 3 ? normalizedHex.split("").map((character) => `${character}${character}`).join("") : normalizedHex;

  if (expandedHex.length !== 6) return "#FFFFFF";

  const red = Number.parseInt(expandedHex.slice(0, 2), 16) / 255;
  const green = Number.parseInt(expandedHex.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(expandedHex.slice(4, 6), 16) / 255;

  const linearize = (component: number) => {
    return component <= 0.03928 ? component / 12.92 : ((component + 0.055) / 1.055) ** 2.4;
  };

  const relativeLuminance =
    0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue);

  // WCAG-friendly heuristic: pick dark text for light backgrounds, and vice versa.
  return relativeLuminance > 0.6 ? "#0B0F19" : "#FFFFFF";
}

function ColorSwatch({ label, hex }: { label: string; hex: string }) {
  const readableTextColor = getReadableTextColor(hex);
  const overlayBackground = readableTextColor === "#0B0F19" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const [copyFeedback, setCopyFeedback] = useState<"idle" | "copied" | "failed">("idle");
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopyFeedback("copied");
    } catch {
      setCopyFeedback("failed");
    } finally {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopyFeedback("idle"), 1200);
    }
  };

  return (
    <div className="group flex min-w-0 flex-1 flex-col sm:max-w-[180px]">
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="relative aspect-[3/1.6] w-full cursor-pointer rounded-2xl shadow-sm ring-[0.5px] ring-inset ring-black/[0.08] dark:ring-white/[0.1] transition-transform group-hover:-translate-y-[1px] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        style={{ backgroundColor: hex }}
        title={`Click to copy ${hex}`}
        aria-label={`Copy ${label} ${hex} color`}
      >
        <span
          className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider"
          style={{
            color: readableTextColor,
            backgroundColor: overlayBackground,
            textShadow: "0 1px 2px rgba(0,0,0,0.35)",
          }}
        >
          {label}
        </span>

        <span
          className="flex h-full w-full items-center justify-center px-3 text-center font-mono text-[0.8rem] font-semibold tracking-wide"
          style={{
            color: readableTextColor,
            textShadow: "0 1px 2px rgba(0,0,0,0.35)",
          }}
        >
          {hex.toUpperCase()}
        </span>

        <span
          className={`pointer-events-none absolute right-2 top-2 rounded-md px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider backdrop-blur transition-opacity ${
            copyFeedback === "idle" ? "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" : "opacity-100"
          }`}
          style={{
            backgroundColor: overlayBackground,
            color: readableTextColor,
            textShadow: "0 1px 2px rgba(0,0,0,0.35)",
          }}
        >
          {copyFeedback === "copied" ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5" />
              Copied
            </span>
          ) : copyFeedback === "failed" ? (
            "Failed"
          ) : (
            "Copy"
          )}
        </span>
      </button>
    </div>
  );
}

const QUESTION_MARK_TOKEN = "?";

function MissingColorSwatch({ label }: { label: string }) {
  const hint = `${label} color not available`;
  return (
    <div className="group flex min-w-0 flex-1 sm:max-w-[180px]">
      <div className="relative flex aspect-[3/1.6] w-full items-center justify-center rounded-2xl border-[0.5px] border-dashed border-border/70 bg-background/20">
        <span className="absolute left-2 top-2 rounded-md bg-background/60 px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-[0.95rem] font-bold tracking-wide text-muted-foreground" title={hint}>
          {QUESTION_MARK_TOKEN}
        </span>
        <div
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max max-w-[220px] -translate-x-1/2 rounded-lg border-[0.5px] border-border/60 bg-background/95 px-2 py-1 text-center text-[0.65rem] font-medium text-muted-foreground opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100"
        >
          {hint}
        </div>
      </div>
    </div>
  );
}

function ColorSwatchSlot({ label, hex }: { label: string; hex: string | null }) {
  if (!hex) return <MissingColorSwatch label={label} />;
  return <ColorSwatch label={label} hex={hex} />;
}

function VoiceCard({
  icon: VoiceIcon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border-[0.5px] border-border/70 bg-muted/10 p-2 sm:p-3">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm ring-[0.5px] ring-border/60">
          <VoiceIcon className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
        </span>
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="text-sm font-medium capitalize leading-snug text-foreground sm:text-base">
        {value}
      </p>
    </div>
  );
}

function BrandPaletteStrip({ branding }: { branding: BrandingDNA }) {
  const { primary, secondary } = resolveBrandColors(branding);
  if (!primary && !secondary) return null;
  const singleHex = primary ?? secondary;
  return (
    <div className="flex h-2.5 w-full min-w-0 shrink-0" aria-hidden>
      {primary && secondary ? (
        <>
          <div
            className="min-h-0 min-w-0 flex-1 basis-0"
            style={{ backgroundColor: primary }}
          />
          <div
            className="min-h-0 min-w-0 flex-1 basis-0"
            style={{ backgroundColor: secondary }}
          />
        </>
      ) : (
        <div
          className="min-h-0 w-full min-w-0 flex-1"
          style={{ backgroundColor: singleHex ?? undefined }}
        />
      )}
    </div>
  );
}

function OpenGraphPreview({ ogImage }: { ogImage: string | null }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [ogImage]);

  const shouldShowFallback = !ogImage || imageFailed;
  const hint = "Open Graph preview unavailable";

  return (
    <div className="relative aspect-[1200/280] w-full">
      {shouldShowFallback ? (
        <div className="group absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
          <div className="flex size-10 items-center justify-center rounded-full border-[0.5px] border-dashed border-border/70 bg-background/25">
            <span className="font-mono text-sm font-bold tracking-wide text-muted-foreground" title={hint}>
              {QUESTION_MARK_TOKEN}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Open Graph preview unavailable</p>
          <div className="mt-1 hidden text-[0.65rem] text-muted-foreground/80 group-hover:block">
            Image missing or failed to load (404/blocked).
          </div>
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ogImage}
            alt=""
            className="absolute inset-0 h-full w-full object-contain object-center"
            onError={() => {
              setImageFailed(true);
            }}
          />
        </>
      )}
    </div>
  );
}

function BrandPalette({
  branding,
  personality,
}: {
  branding: BrandingDNA;
  personality: BrandingPersonality | null;
}) {
  const { primary, secondary } = resolveBrandColors(branding);
  const hasPalette = Boolean(primary || secondary);
  const typographyEntries: TypographyEntry[] = Array.isArray(branding.typography) ? branding.typography : [];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Branding panel header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted/50 ring-[0.5px] ring-border/70 sm:size-12"
          style={primary ? { boxShadow: `inset 0 0 0 1px ${primary}50` } : undefined}
        >
          <Dna className="size-5 text-foreground sm:size-6" strokeWidth={1.5} />
        </span>
        <div className="min-w-0 space-y-1">
          <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            DNA preview
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Branding from the website at this URL
          </p>
        </div>
      </div>

      {/* 2x2 grid: Palette, Identity, Voice, Typography */}
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5"
        aria-label="Branding sections"
      >
        {/* Color palette */}
        <section aria-label="Brand colors" className="space-y-3">
            <SectionLabel icon={Palette}>Palette</SectionLabel>
            <div className="rounded-2xl border-[0.5px] border-border/60 bg-card/60 p-3 shadow-sm sm:p-4">
              {hasPalette ? (
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <ColorSwatchSlot label="Primary" hex={primary} />
                  <ColorSwatchSlot label="Secondary" hex={secondary} />
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2 rounded-xl border-[0.5px] border-dashed border-border/60 bg-background/40 px-3 py-3">
                  <p className="text-sm font-medium text-foreground">No colors detected</p>
                  <p className="text-xs text-muted-foreground">
                    We couldn’t extract enough signals from this page to infer a palette.
                  </p>
                </div>
              )}
            </div>
          </section>

        {/* Identity assets */}
        <section aria-label="Identity assets" className="space-y-3">
            <SectionLabel icon={Images}>Identity</SectionLabel>
            <div className="rounded-2xl border-[0.5px] border-border/60 bg-card/60 p-3 shadow-sm sm:p-4">
              {(branding.logo || branding.favicon || branding.ogImage) ? (
                <div className="flex flex-col gap-3">
                  {/* Logo + Favicon row */}
                  {(branding.logo || branding.favicon) && (
                    <div className="flex flex-wrap gap-3">
                      {branding.logo && (
                        <div className="space-y-2">
                          <p className="text-[0.58rem] font-semibold uppercase tracking-wider text-muted-foreground">
                            Logo
                          </p>
                          <div
                            className="flex h-14 w-24 items-center justify-center rounded-xl border-[0.5px] border-border/60 bg-background p-2 shadow-sm"
                            style={primary ? { borderColor: `${primary}80` } : undefined}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={branding.logo}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {branding.favicon && (
                        <div className="space-y-2">
                          <p className="text-[0.58rem] font-semibold uppercase tracking-wider text-muted-foreground">
                            Favicon
                          </p>
                          <div className="flex size-14 items-center justify-center rounded-xl bg-background shadow-sm ring-[0.5px] ring-border/60">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={branding.favicon}
                              alt=""
                              className="max-h-7 max-w-7 object-contain"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* OG image */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Share2 className="size-2.5 text-muted-foreground" strokeWidth={2} />
                      <p className="text-[0.58rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        Open Graph preview
                      </p>
                    </div>
                    <div className="overflow-hidden rounded-xl bg-muted/25 ring-[0.5px] ring-border/60">
                      <OpenGraphPreview ogImage={branding.ogImage} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2 rounded-xl border-[0.5px] border-dashed border-border/60 bg-background/40 px-3 py-3">
                  <p className="text-sm font-medium text-foreground">No identity assets</p>
                  <p className="text-xs text-muted-foreground">
                    We couldn’t find logo, favicon, or an OG image for this page.
                  </p>
                </div>
              )}
            </div>
          </section>

        {/* Voice & personality */}
        <section aria-label="Voice and personality" className="space-y-3 sm:col-span-2">
          <SectionLabel icon={Sparkles}>Voice &amp; personality</SectionLabel>
          {personality ? (
            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              <VoiceCard icon={MessageSquare} label="Tone" value={personality.tone} />
              <VoiceCard icon={Zap} label="Energy" value={personality.energy} />
              <VoiceCard icon={Users} label="Audience" value={personality.audience} />
              {personality.voice ? (
                <VoiceCard icon={Sparkles} label="Voice" value={personality.voice} />
              ) : null}
              {personality.archetype ? (
                <VoiceCard icon={Dna} label="Archetype" value={personality.archetype} />
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-2 rounded-xl border-[0.5px] border-dashed border-border/60 bg-background/40 px-3 py-3">
              <p className="text-sm font-medium text-foreground">No personality data</p>
              <p className="text-xs text-muted-foreground">
                Re-scrape this site to get AI-derived personality specs.
              </p>
            </div>
          )}
        </section>

        {/* Typography */}
        <section aria-label="Typography" className="space-y-3 sm:col-span-2">
            <SectionLabel icon={Type}>Typography</SectionLabel>
            <div className="rounded-2xl border-[0.5px] border-border/60 bg-card/60 p-3 shadow-sm sm:p-4">
              {typographyEntries.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {typographyEntries.map((entry) => (
                    <div
                      key={entry.fontfamily}
                      className="flex flex-col gap-1 rounded-lg border-[0.5px] border-border/60 bg-background px-3 py-2 shadow-sm"
                    >
                      <span className="inline-flex items-center gap-1.5 font-mono text-[0.8rem] text-foreground">
                        <span className="text-[0.6rem] font-sans font-bold uppercase tracking-wider text-muted-foreground">
                          Aa
                        </span>
                        {entry.fontfamily}
                      </span>
                      <span className="font-mono text-[0.65rem] text-muted-foreground">
                        body {entry.body} · heading {entry.heading}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2 rounded-xl border-[0.5px] border-dashed border-border/60 bg-background/40 px-3 py-3">
                  <p className="text-sm font-medium text-foreground">No typography signals</p>
                  <p className="text-xs text-muted-foreground">
                    We couldn't extract font families or weight information from this URL.
                  </p>
                </div>
              )}
            </div>
          </section>
      </div>
    </div>
  );
}


export function ResultExperience({
  result,
  onRescan,
  fromLibrary,
  backHref = "/dashboard",
}: {
  result: ScrapeResult;
  onRescan?: () => void;
  fromLibrary?: boolean;
  backHref?: string;
}) {
  const router = useRouter();
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteSavedContext,
    initialDeleteState,
  );

  useEffect(() => {
    if (deleteState.deletedContextId) router.push(backHref);
  }, [deleteState.deletedContextId, router, backHref]);

  const newUrlEl = onRescan ? (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onRescan}
      className="shrink-0 gap-1.5 rounded-lg"
    >
      <Globe className="size-3.5" />
      Re-extract branding
    </Button>
  ) : (
    <Link
      href="/dashboard/dna"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg",
      )}
    >
      <Globe className="size-3.5" />
      Extract another URL
    </Link>
  );

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      {/* Header */}
      <header className="relative flex shrink-0 flex-col gap-1.5 border-b-[0.5px] border-border/60 bg-card/50 px-4 py-2 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div
          className="pointer-events-none absolute inset-x-0 -top-8 h-28 bg-accent-gradient-subtle opacity-15 blur-2xl"
          aria-hidden
        />
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              "shrink-0 rounded-lg",
            )}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {result.name}
              </h1>
              {fromLibrary ? (
                <Badge
                  variant="secondary"
                  className="gap-1 border-[0.5px] border-border/70 bg-muted/60 text-foreground"
                >
                  <Library className="size-2.5 opacity-80" />
                  Saved
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="gap-1 border-[0.5px] border-border/70 bg-muted/60 text-foreground"
                >
                  <Dna className="size-2.5 opacity-80" />
                  DNA ready
                </Badge>
              )}
            </div>
            <p className="mt-0.5 break-all font-mono text-[0.65rem] text-muted-foreground sm:text-xs">
              <span className="text-muted-foreground/70">Source:</span> {result.scrapedUrl}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {fromLibrary && (
            <DeleteDnaButton
              contextId={result.id}
              deleteFormAction={deleteFormAction}
              deletePending={deletePending}
            />
          )}
          {newUrlEl}
        </div>
      </header>

      {/* Content: scrollable; inner centers the panel when shorter than the viewport */}
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain scroll-smooth">
        <div className="flex min-h-[calc(100dvh-5.25rem)] flex-col items-center justify-center px-3 py-6 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] sm:px-5 sm:py-8 sm:pb-[max(1.75rem,env(safe-area-inset-bottom,0px))] lg:px-8">
          <div className="w-full max-w-5xl">
            {result.branding ? (
              <section className="overflow-hidden rounded-2xl border-[0.5px] border-border/60 bg-card/90 shadow-sm ring-[0.5px] ring-foreground/[0.03] backdrop-blur-sm">
                <BrandPaletteStrip branding={result.branding} />
                <div className="p-5 sm:p-6">
                  <BrandPalette branding={result.branding} personality={result.personality ?? null} />
                </div>
              </section>
            ) : (
              <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border-[0.5px] border-dashed border-border/60 bg-card/80 px-4 py-12 text-center sm:py-14">
                <Dna className="size-8 text-muted-foreground/40" strokeWidth={1.5} />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">No branding found</p>
                  <p className="text-xs text-muted-foreground">
                    We couldn’t detect enough branding signals for this URL.
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteDnaButton({
  contextId,
  deleteFormAction,
  deletePending,
}: {
  contextId: string;
  deleteFormAction: (formData: FormData) => void | Promise<void>;
  deletePending: boolean;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger
        type="button"
        className={cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "shrink-0 rounded-lg text-muted-foreground hover:border-destructive/40 hover:bg-destructive/8 hover:text-destructive",
        )}
        disabled={deletePending}
        aria-label="Delete saved branding"
      >
        {deletePending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Trash2 className="size-3.5" />
        )}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <AlertDialog.Viewport>
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border-[0.5px] border-border/70 bg-background p-5 shadow-xl">
            <AlertDialog.Title className="text-base font-semibold text-foreground">
              Delete saved branding?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
              This permanently removes this capture from your library. This action cannot be undone.
            </AlertDialog.Description>
            <form action={deleteFormAction} className="mt-5 flex items-center justify-end gap-2">
              <input type="hidden" name="contextId" value={contextId} />
              <AlertDialog.Close
                type="button"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Cancel
              </AlertDialog.Close>
              <Button type="submit" variant="destructive" size="sm" disabled={deletePending}>
                Delete
              </Button>
            </form>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
