"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { BrandingDNA, ScrapeResult, DeleteDNAState } from "@/app/actions/scrape";
import { deleteSavedContext } from "@/app/actions/scrape";
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
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { FormattedDate, FORMAT_DATE_SHORT } from "@/components/formatted-date";

const initialDeleteState: DeleteDNAState = {};

function resolveBrandColors(branding: BrandingDNA): { primary: string | null; secondary: string | null } {
  const colors = branding.colors as unknown;
  if (Array.isArray(colors)) {
    return { primary: colors[0] ?? null, secondary: colors[1] ?? null };
  }
  const colorsObject = colors as { primary?: string | null; secondary?: string | null };
  return { primary: colorsObject.primary ?? null, secondary: colorsObject.secondary ?? null };
}

function resolveBrandFonts(branding: BrandingDNA): { primary: string | null; secondary: string | null } {
  const fonts = branding.fonts as unknown;
  if (Array.isArray(fonts)) {
    return { primary: fonts[0] ?? null, secondary: fonts[1] ?? null };
  }
  const fontsObject = fonts as { primary?: string | null; secondary?: string | null };
  return { primary: fontsObject.primary ?? null, secondary: fontsObject.secondary ?? null };
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

function ColorSwatch({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="group flex min-w-0 flex-1 flex-col gap-2 sm:max-w-[180px]">
      <div
        className="aspect-[3/1.6] w-full rounded-2xl shadow-sm ring-1 ring-inset ring-black/[0.08] dark:ring-white/[0.1]"
        style={{ backgroundColor: hex }}
        title={hex}
      />
      <div className="flex items-center gap-1.5">
        <div>
          <p className="text-[0.58rem] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="font-mono text-[0.75rem] font-medium tabular-nums tracking-wide text-foreground">
            {hex.toUpperCase()}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void navigator.clipboard.writeText(hex)}
          className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={`Copy ${label} color`}
          title="Copy hex"
        >
          <Copy className="size-3 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    </div>
  );
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
    <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-muted/10 p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border/60">
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

function BrandPalette({ branding }: { branding: BrandingDNA }) {
  const { primary, secondary } = resolveBrandColors(branding);
  const fonts = resolveBrandFonts(branding);
  const hasPalette = Boolean(primary || secondary);

  return (
    <div className="space-y-4">
      {/* Full-bleed palette strip at top */}
      {hasPalette && (
        <div className="-mx-4 -mt-4 overflow-hidden rounded-t-2xl sm:-mx-6 sm:-mt-6" aria-hidden>
          <div className="flex h-2.5">
            {primary && <div className="min-w-0 flex-1" style={{ backgroundColor: primary }} />}
            {secondary && <div className="min-w-0 flex-1" style={{ backgroundColor: secondary }} />}
            <div className="min-w-0 flex-[2] bg-gradient-to-r from-muted to-border/30" />
          </div>
        </div>
      )}

      {/* DNA header */}
      <div className="flex items-center gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/70"
          style={primary ? { boxShadow: `inset 0 0 0 1px ${primary}50` } : undefined}
        >
          <Dna className="size-4.5 text-foreground" strokeWidth={1.5} />
        </span>
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Brand DNA Preview
          </h2>
          <p className="text-[0.65rem] text-muted-foreground">
            Captured identity signals from this URL
          </p>
        </div>
      </div>

      {/* 2x2 grid: Palette, Identity, Voice, Typography */}
      <div className="grid gap-4 sm:grid-cols-2" aria-label="DNA sections">
        {/* Color palette */}
        <section aria-label="Brand colors" className="space-y-3">
            <SectionLabel icon={Palette}>Palette</SectionLabel>
            <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm sm:p-5">
              {hasPalette ? (
                <div className="flex flex-wrap gap-4 sm:gap-5">
                  {primary && <ColorSwatch label="Primary" hex={primary} />}
                  {secondary && <ColorSwatch label="Secondary" hex={secondary} />}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-border/60 bg-background/40 px-3 py-4">
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
            <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm sm:p-5">
              {(branding.logo || branding.favicon || branding.ogImage) ? (
                <div className="flex flex-col gap-4">
                  {/* Logo + Favicon row */}
                  {(branding.logo || branding.favicon) && (
                    <div className="flex flex-wrap gap-4">
                      {branding.logo && (
                        <div className="space-y-2">
                          <p className="text-[0.58rem] font-semibold uppercase tracking-wider text-muted-foreground">
                            Logo
                          </p>
                          <div
                            className="flex h-14 w-24 items-center justify-center rounded-xl border-2 border-border/60 bg-background p-2 shadow-sm"
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
                          <div className="flex size-14 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border/60">
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
                  {branding.ogImage && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Share2 className="size-2.5 text-muted-foreground" strokeWidth={2} />
                        <p className="text-[0.58rem] font-semibold uppercase tracking-wider text-muted-foreground">
                          Open Graph preview
                        </p>
                      </div>
                      <div className="overflow-hidden rounded-xl bg-muted/25 ring-1 ring-border/60">
                        <div className="relative aspect-[1200/280] w-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={branding.ogImage}
                            alt=""
                            className="absolute inset-0 h-full w-full object-contain object-center"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-border/60 bg-background/40 px-3 py-4">
                  <p className="text-sm font-medium text-foreground">No identity assets</p>
                  <p className="text-xs text-muted-foreground">
                    We couldn’t find logo, favicon, or an OG image for this page.
                  </p>
                </div>
              )}
            </div>
          </section>

        {/* Voice & personality */}
        <section aria-label="Voice and personality" className="space-y-3">
          <SectionLabel icon={Sparkles}>Voice &amp; personality</SectionLabel>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <VoiceCard icon={MessageSquare} label="Tone" value={branding.personality.tone} />
            <VoiceCard icon={Zap} label="Energy" value={branding.personality.energy} />
            <VoiceCard icon={Users} label="Audience" value={branding.personality.audience} />
          </div>
        </section>

        {/* Typography */}
        <section aria-label="Typography" className="space-y-3">
            <SectionLabel icon={Type}>Typography</SectionLabel>
            <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm sm:p-5">
              {(fonts.primary || fonts.secondary || branding.typography) ? (
                <>
                  {(fonts.primary || fonts.secondary) && (
                    <div className="flex flex-wrap gap-2">
                      {fonts.primary && (
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1.5 font-mono text-[0.8rem] text-foreground shadow-sm">
                          <span className="text-[0.6rem] font-sans font-bold uppercase tracking-wider text-muted-foreground">
                            Aa
                          </span>
                          {fonts.primary}
                        </span>
                      )}
                      {fonts.secondary && (
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1.5 font-mono text-[0.8rem] text-foreground shadow-sm">
                          <span className="text-[0.6rem] font-sans font-bold uppercase tracking-wider text-muted-foreground">
                            Aa
                          </span>
                          {fonts.secondary}
                        </span>
                      )}
                    </div>
                  )}
                  {branding.typography && (
                    <p
                      className={cn(
                        "font-mono text-[0.8rem] leading-relaxed text-muted-foreground",
                        (fonts.primary || fonts.secondary) && "mt-3 border-t border-border/50 pt-3",
                        "line-clamp-3",
                      )}
                    >
                      {branding.typography}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-border/60 bg-background/40 px-3 py-4">
                  <p className="text-sm font-medium text-foreground">No typography signals</p>
                  <p className="text-xs text-muted-foreground">
                    We couldn’t extract font families or typing behavior from this URL.
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
      Re-extract DNA
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
      <header className="relative flex shrink-0 flex-col gap-2 border-b border-border/60 bg-card/50 px-4 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
                <Badge variant="secondary" className="gap-1 border-border/70 bg-muted/60 text-foreground">
                  <Library className="size-2.5 opacity-80" />
                  Saved
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 border-border/70 bg-muted/60 text-foreground">
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

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain scroll-smooth lg:overflow-y-hidden">
        <div className="mx-auto w-full max-w-6xl space-y-4 px-3 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] sm:px-4 sm:py-5 sm:pb-[max(2rem,env(safe-area-inset-bottom,0px))]">
          {/* DNA hero */}
          <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm ring-1 ring-foreground/[0.03] backdrop-blur-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <span className="gradient-pill flex items-center gap-1.5 text-[0.61rem]">
                  <Dna className="size-3.5" /> DNA preview
                </span>
                <h2 className="font-heading text-balance text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  Brand signals, distilled into a single identity profile.
                </h2>
                <p className="max-w-[60ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Captured from{" "}
                  <span className="font-mono text-foreground">{result.baseUrl}</span> on{" "}
                  <span className="font-mono text-foreground">
                    <FormattedDate date={result.createdAt} options={FORMAT_DATE_SHORT} />
                  </span>{" "}
                  — {result.sections.length} sections
                  {result.subpages?.length ? ` · ${result.subpages.length} paths` : null}. Review
                  palette, voice, and typography below.
                </p>
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid gap-4">
            {result.branding ? (
              <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm ring-1 ring-foreground/[0.03] backdrop-blur-sm sm:p-6">
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                  <BrandPalette branding={result.branding} />
                </div>
              </section>
            ) : (
              <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/80 px-4 py-12 text-center sm:py-16">
                <Dna className="size-8 text-muted-foreground/40" strokeWidth={1.5} />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">No DNA found</p>
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
        aria-label="Delete DNA"
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
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/70 bg-background p-5 shadow-xl">
            <AlertDialog.Title className="text-base font-semibold text-foreground">
              Delete DNA?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
              This permanently removes the saved context from your library. This action cannot be
              undone.
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
