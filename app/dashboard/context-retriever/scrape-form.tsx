"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { scrapeWebsite, type ScrapeState, type SavedContextSummary } from "@/app/actions/scrape";
import { ResultExperience } from "./context-result-view";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Globe, Loader2, AlertCircle, ArrowLeft, Library, Layers, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormattedDate, FORMAT_DATE_SHORT } from "@/components/formatted-date";

const initialState: ScrapeState = {};

function ScrapeFormInner({
  onRescan,
  savedContexts,
}: {
  onRescan: () => void;
  savedContexts: SavedContextSummary[];
}) {
  const [scrapeState, formAction, scrapePending] = useActionState(scrapeWebsite, initialState);

  const result = scrapeState.result;
  const error = result ? undefined : scrapeState.error;
  const busy = scrapePending;

  if (result) {
    return (
      <ResultExperience
        key={result.id}
        result={result}
        onRescan={onRescan}
        backHref="/dashboard/context-retriever"
      />
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-card/40 px-6 py-4 backdrop-blur-md sm:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 rounded-lg")}
          >
            <ArrowLeft className="mr-1.5 size-3.5" />
            Back
          </Link>
          <div className="min-w-0">
            <p className="font-heading text-sm font-semibold tracking-tight text-foreground">Context Retriever</p>
            <p className="text-xs text-muted-foreground">URL in → structured context &amp; brand DNA out</p>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground sm:inline-flex">
          <Sparkles className="size-3 text-muted-foreground" />
          Live capture
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col justify-start overflow-y-auto overscroll-contain px-6 py-10 sm:px-8 sm:py-12 lg:flex-[1.2] lg:px-10 lg:py-14 xl:px-14">
          <div className="mx-auto w-full max-w-3xl lg:mx-0 lg:max-w-none">
            <div className="mb-10 space-y-4">
              <span className="gradient-pill text-[0.6rem] tracking-[0.14em]">Step 1 of 3</span>
              <h1 className="font-heading text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem] lg:leading-[1.1]">
                Drop your website link.
                <span className="mt-1 block text-2xl font-medium text-muted-foreground sm:mt-2 sm:text-3xl lg:text-[1.75rem]">
                  We learn the page in minutes — not with a dead fetch.
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                A real browser session, then one structured result: identity assets, voice, and typography
                you can trust for downstream workflows.
              </p>
            </div>

            <div className="mb-10 grid gap-3 sm:grid-cols-3">
              {(
                [
                  {
                    stepNumber: "01",
                    title: "Paste URL",
                    description: "Any public page you want to understand.",
                  },
                  {
                    stepNumber: "02",
                    title: "We render",
                    description: "Headless browser, same DOM visitors see.",
                  },
                  {
                    stepNumber: "03",
                    title: "You review",
                    description: "Brand DNA and marks in a single view.",
                  },
                ] as const
              ).map((row) => (
                <div
                  key={row.stepNumber}
                  className="rounded-xl border border-border/70 bg-card/50 px-4 py-3.5 ring-1 ring-foreground/[0.03] sm:py-4"
                >
                  <p className="font-heading text-lg font-bold tabular-nums text-foreground/15">{row.stepNumber}</p>
                  <p className="font-heading text-sm font-semibold text-foreground">{row.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{row.description}</p>
                </div>
              ))}
            </div>

            <Separator className="mb-10 max-w-xl bg-border/80" />

            <form action={formAction} className="space-y-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Your link
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-background px-4 py-0.5 shadow-sm transition-[box-shadow,border-color] focus-within:border-foreground/25 focus-within:ring-2 focus-within:ring-ring/40">
                  <Globe className="size-5 shrink-0 text-muted-foreground" />
                  <Input
                    name="url"
                    type="url"
                    placeholder="https://yoursite.com"
                    required
                    disabled={busy}
                    className="h-12 border-0 bg-transparent text-base shadow-none placeholder:text-muted-foreground/65 focus-visible:ring-0 sm:h-[3.25rem] sm:text-[1.0625rem]"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={busy}
                  className="h-12 shrink-0 rounded-xl px-8 text-sm font-semibold sm:min-w-[9.5rem] sm:text-base"
                >
                  {scrapePending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Capturing…
                    </>
                  ) : (
                    "Retrieve context"
                  )}
                </Button>
              </div>
            </form>

            {error && (
              <div className="mt-6 flex gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {savedContexts.length > 0 && (
          <aside className="flex max-h-[min(42vh,22rem)] min-h-0 shrink-0 flex-col border-t border-border/70 bg-muted/15 md:max-h-none lg:w-[22rem] lg:shrink-0 lg:border-l lg:border-t-0 xl:w-[24rem]">
            <div className="shrink-0 border-b border-border/50 bg-card/40 px-5 py-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-foreground">
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground ring-1 ring-border">
                  <Library className="size-[1.125rem]" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="font-heading text-sm font-semibold tracking-tight">Your library</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Jump back into any site you already captured.
                  </p>
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-4">
              {savedContexts.map((savedContext, index) => (
                <Link
                  key={savedContext.id}
                  href={`/dashboard/context-retriever/${savedContext.id}`}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-md border border-border/70 bg-muted/20 px-3 py-2.5 text-left transition-colors hover:bg-muted/35",
                    index % 2 === 1 && "bg-muted/30",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">{savedContext.name}</span>
                    <span className="mt-0.5 block truncate font-mono text-[0.7rem] text-muted-foreground">
                      {savedContext.baseUrl}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-0.5 text-[0.65rem] text-muted-foreground">
                    <span className="flex items-center gap-1 tabular-nums">
                      <Clock className="size-3 opacity-70" />
                      <FormattedDate date={savedContext.createdAt} options={FORMAT_DATE_SHORT} />
                    </span>
                    {savedContext.subcontextCount > 1 && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Layers className="size-3" />
                        {savedContext.subcontextCount} paths
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export function ScrapeForm({ savedContexts }: { savedContexts: SavedContextSummary[] }) {
  const [key, setKey] = useState(0);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrapeFormInner
        key={key}
        onRescan={() => setKey((previousKey) => previousKey + 1)}
        savedContexts={savedContexts}
      />
    </div>
  );
}
