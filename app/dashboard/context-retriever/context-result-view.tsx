"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import type { BrandingDNA, ScrapeResult } from "@/app/actions/scrape";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  CheckCircle2,
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 ring-1 ring-border/60">
        <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
      </span>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{children}</p>
    </div>
  );
}

function BrandColorSwatch({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-[200px]">
      <div
        className="aspect-[5/3] w-full rounded-2xl border border-border/60 shadow-sm ring-1 ring-inset ring-black/[0.06] dark:ring-white/[0.08]"
        style={{ backgroundColor: hex }}
        title={hex}
      />
      <div className="space-y-0.5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-mono text-xs font-medium tabular-nums tracking-wide text-foreground">{hex.toUpperCase()}</p>
      </div>
    </div>
  );
}

function BrandPalette({ branding }: { branding: BrandingDNA }) {
  const { primary, secondary } = resolveBrandColors(branding);
  const fonts = resolveBrandFonts(branding);
  const hasPalette = Boolean(primary || secondary);

  return (
    <div className="space-y-9">
      {hasPalette && (
        <div
          className="-mx-6 -mt-6 flex h-2 overflow-hidden rounded-t-2xl sm:-mx-8 sm:-mt-8"
          aria-hidden
        >
          {primary && <div className="min-w-0 flex-1" style={{ backgroundColor: primary }} />}
          {secondary && <div className="min-w-0 flex-1" style={{ backgroundColor: secondary }} />}
        </div>
      )}

      <header className="space-y-3">
        <div className="flex flex-wrap items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted/40 ring-1 ring-border/70"
            style={
              primary
                ? { boxShadow: `inset 0 0 0 1px ${primary}40` }
                : undefined
            }
          >
            <Dna className="size-6 text-foreground" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Brand DNA
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Palette, marks, and voice inferred from the live page — ready for downstream prompts and design
              systems.
            </p>
          </div>
        </div>
      </header>

      {hasPalette && (
        <section aria-label="Brand colors" className="space-y-4">
          <SectionHeading icon={Palette}>Palette</SectionHeading>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 sm:p-5">
            <div className="flex flex-wrap gap-6 sm:gap-8">
              {primary && <BrandColorSwatch label="Primary" hex={primary} />}
              {secondary && <BrandColorSwatch label="Secondary" hex={secondary} />}
            </div>
          </div>
        </section>
      )}

      {(branding.logo || branding.favicon || branding.ogImage) && (
        <section aria-label="Identity assets" className="space-y-4">
          <SectionHeading icon={Images}>Identity</SectionHeading>
          <div className="grid gap-4 rounded-2xl border border-border/70 bg-muted/15 p-4 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-6 sm:p-5">
            <div className="flex flex-wrap gap-5">
              {branding.logo && (
                <div className="space-y-2">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">Logo</p>
                  <div
                    className="flex h-[4.5rem] w-[7.5rem] items-center justify-center rounded-xl border-2 border-border/60 bg-background p-2 shadow-sm"
                    style={primary ? { borderColor: `${primary}99` } : undefined}
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
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">Favicon</p>
                  <div className="flex size-[4.5rem] items-center justify-center rounded-xl bg-background p-2 shadow-sm ring-1 ring-border/70">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={branding.favicon}
                      alt=""
                      className="max-h-9 max-w-9 object-contain"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            {branding.ogImage && (
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Share2 className="size-3 text-muted-foreground" strokeWidth={2} />
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Social preview
                  </p>
                </div>
                <div className="overflow-hidden rounded-xl bg-muted/25 ring-1 ring-border/70">
                  <div className="relative aspect-[1200/300] w-full">
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
        </section>
      )}

      <section aria-label="Voice and audience" className="space-y-4">
        <SectionHeading icon={Sparkles}>Voice</SectionHeading>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex gap-3 rounded-xl border border-border/70 bg-muted/10 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border/60">
              <MessageSquare className="size-4 text-muted-foreground" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">Tone</p>
              <p className="mt-1 break-words text-sm font-medium capitalize leading-snug text-foreground">
                {branding.personality.tone}
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-border/70 bg-muted/10 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border/60">
              <Zap className="size-4 text-muted-foreground" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">Energy</p>
              <p className="mt-1 break-words text-sm font-medium capitalize leading-snug text-foreground">
                {branding.personality.energy}
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-border/70 bg-muted/10 p-4 sm:col-span-1">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border/60">
              <Users className="size-4 text-muted-foreground" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">Audience</p>
              <p className="mt-1 break-words text-sm font-medium leading-snug text-foreground">
                {branding.personality.audience}
              </p>
            </div>
          </div>
        </div>
      </section>

      {(fonts.primary || fonts.secondary || branding.typography) && (
        <section
          aria-label="Typography"
          className="space-y-4 rounded-2xl border border-border/70 bg-muted/10 p-4 sm:p-5"
        >
          <div className="flex items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border/60">
              <Type className="size-4 text-muted-foreground" strokeWidth={1.75} />
            </span>
            <p className="text-sm font-semibold text-foreground">Typography</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {fonts.primary && (
              <span className="inline-flex max-w-full items-center gap-1.5 break-all rounded-lg border border-border/70 bg-background px-2.5 py-1.5 font-mono text-xs text-foreground">
                <span className="text-[0.65rem] font-sans font-medium uppercase tracking-wider text-muted-foreground">
                  Aa
                </span>
                {fonts.primary}
              </span>
            )}
            {fonts.secondary && (
              <span className="inline-flex max-w-full items-center gap-1.5 break-all rounded-lg border border-border/70 bg-background px-2.5 py-1.5 font-mono text-xs text-foreground">
                <span className="text-[0.65rem] font-sans font-medium uppercase tracking-wider text-muted-foreground">
                  Aa
                </span>
                {fonts.secondary}
              </span>
            )}
          </div>
          {branding.typography && (
            <p className="border-t border-border/50 pt-3 font-mono text-xs leading-relaxed break-words text-muted-foreground">
              {branding.typography}
            </p>
          )}
        </section>
      )}
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
  /** Where the back arrow goes (e.g. retriever home for a saved-context page). */
  backHref?: string;
}) {
  const newUrlEl = onRescan ? (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onRescan}
      className="shrink-0 self-start rounded-lg sm:self-auto"
    >
      <Globe className="mr-2 size-4" />
      New URL
    </Button>
  ) : (
    <Link
      href="/dashboard/context-retriever"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "inline-flex shrink-0 self-start items-center justify-center rounded-lg sm:self-auto",
      )}
    >
      <Globe className="mr-2 size-4" />
      New URL
    </Link>
  );

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 flex-col gap-4 border-b border-border/70 bg-card/45 px-6 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              "mt-0.5 shrink-0 rounded-lg",
            )}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {result.name}
              </h1>
              {fromLibrary ? (
                <Badge className="border-border/80 bg-muted/60 text-foreground" variant="secondary">
                  <Library className="mr-1 size-3 opacity-80" />
                  Library
                </Badge>
              ) : (
                <Badge className="border-border/80 bg-muted/60 text-foreground" variant="secondary">
                  <CheckCircle2 className="mr-1 size-3 opacity-80" />
                  Done
                </Badge>
              )}
            </div>
            <p className="mt-1 break-all font-mono text-[0.7rem] text-muted-foreground sm:text-xs">{result.scrapedUrl}</p>
          </div>
        </div>
        {newUrlEl}
      </header>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain scroll-smooth">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))] sm:px-8 sm:py-10 sm:pb-[max(3rem,env(safe-area-inset-bottom,0px))]">
          {result.branding ? (
            <section className="overflow-x-hidden rounded-2xl border border-border/60 bg-card/85 p-6 shadow-sm ring-1 ring-foreground/[0.04] backdrop-blur-sm sm:p-8">
              <BrandPalette branding={result.branding} />
            </section>
          ) : (
            <p className="rounded-lg border border-border/60 bg-card/80 px-6 py-10 text-center text-sm text-muted-foreground backdrop-blur-sm">
              No branding data was detected for this page.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
