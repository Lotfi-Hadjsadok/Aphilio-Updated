"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { scrapeWebsite, type ScrapeState, type SavedContextSummary } from "@/app/actions/scrape";
import { deleteSavedContext, type DeleteDNAState } from "@/app/actions/scrape";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Globe,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Library,
  Layers,
  Clock,
  Sparkles,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormattedDate, FORMAT_DATE_SHORT } from "@/components/formatted-date";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Drawer } from "@base-ui/react/drawer";

const initialState: ScrapeState = {};
const initialDeleteState: DeleteDNAState = {};

const processSteps = [
  { stepNumber: "01", label: "Paste URL" },
  { stepNumber: "02", label: "We render" },
  { stepNumber: "03", label: "You review" },
] as const;

function DeleteConfirmDialog({
  savedContext,
  deleteFormAction,
  deletePending,
}: {
  savedContext: SavedContextSummary;
  deleteFormAction: (formData: FormData) => void | Promise<void>;
  deletePending: boolean;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger
        type="button"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-xs" }),
          "shrink-0 opacity-0 text-muted-foreground transition-opacity group-hover/item:opacity-100 hover:text-destructive hover:bg-destructive/10",
        )}
        disabled={deletePending}
        aria-label={`Delete ${savedContext.name}`}
      >
        <Trash2 className="size-3.5" />
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <AlertDialog.Viewport>
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/70 bg-background p-5 shadow-xl">
            <AlertDialog.Title className="text-base font-semibold text-foreground">
              Delete DNA?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
              This will permanently remove{" "}
              <span className="font-medium text-foreground">{savedContext.name}</span> from your
              library.
            </AlertDialog.Description>
            <form action={deleteFormAction} className="mt-5 flex items-center justify-end gap-2">
              <input type="hidden" name="contextId" value={savedContext.id} />
              <AlertDialog.Close
                type="button"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Cancel
              </AlertDialog.Close>
              <Button type="submit" variant="destructive" size="sm" disabled={deletePending}>
                {deletePending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                Delete
              </Button>
            </form>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

function LibraryItem({
  savedContext,
  deleteFormAction,
  deletePending,
  onNavigate,
}: {
  savedContext: SavedContextSummary;
  deleteFormAction: (formData: FormData) => void | Promise<void>;
  deletePending: boolean;
  onNavigate: () => void;
}) {
  return (
    <div className="group/item flex w-full items-center gap-1.5 rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 transition-colors hover:bg-background/90">
      <Link
        href={`/dashboard/dna/${savedContext.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
        onClick={onNavigate}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border/60">
          <Globe className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {savedContext.name}
          </span>
          <span className="mt-0.5 flex items-center gap-2 text-[0.65rem] text-muted-foreground">
            <span className="flex items-center gap-1 tabular-nums">
              <Clock className="size-2.5 opacity-70" />
              <FormattedDate date={savedContext.createdAt} options={FORMAT_DATE_SHORT} />
            </span>
            {savedContext.subcontextCount > 1 && (
              <span className="flex items-center gap-1">
                <Layers className="size-2.5" />
                {savedContext.subcontextCount} paths
              </span>
            )}
          </span>
        </span>
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover/item:text-muted-foreground" />
      </Link>
      <DeleteConfirmDialog
        savedContext={savedContext}
        deleteFormAction={deleteFormAction}
        deletePending={deletePending}
      />
    </div>
  );
}

function LibrarySection({
  savedContexts,
  deleteFormAction,
  deletePending,
  wrapperClassName,
  onNavigate,
}: {
  savedContexts: SavedContextSummary[];
  deleteFormAction: (formData: FormData) => void | Promise<void>;
  deletePending: boolean;
  wrapperClassName: string;
  onNavigate: () => void;
}) {
  return (
    <aside className={wrapperClassName}>
      <div className="shrink-0 border-b border-border/50 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-xl bg-muted ring-1 ring-border/70">
            <Library className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Your library</p>
            <p className="text-[0.65rem] text-muted-foreground">Previously captured sites</p>
          </div>
          <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium tabular-nums text-muted-foreground ring-1 ring-border/60">
            {savedContexts.length}
          </span>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain p-3 lg:overflow-y-hidden">
        {savedContexts.map((savedContext) => (
          <LibraryItem
            key={savedContext.id}
            savedContext={savedContext}
            deleteFormAction={deleteFormAction}
            deletePending={deletePending}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </aside>
  );
}

function ScrapeFormInner({ savedContexts }: { savedContexts: SavedContextSummary[] }) {
  const [scrapeState, formAction, scrapePending] = useActionState(scrapeWebsite, initialState);
  const router = useRouter();
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteSavedContext,
    initialDeleteState,
  );
  const [isLibraryDrawerOpen, setIsLibraryDrawerOpen] = useState(false);

  useEffect(() => {
    if (deleteState.deletedContextId) router.push("/dashboard/dna");
  }, [deleteState.deletedContextId, router]);

  const result = scrapeState.result;
  const error = result ? undefined : scrapeState.error;
  const hasSavedContexts = savedContexts.length > 0;

  const [navigatedToResult, setNavigatedToResult] = useState(false);
  useEffect(() => {
    if (!result?.id || navigatedToResult) return;
    setNavigatedToResult(true);
    router.push(`/dashboard/dna/${result.id}`);
  }, [navigatedToResult, result?.id, router]);

  if (result) {
    return (
      <div className="flex min-h-0 w-full flex-1 items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/50 px-5 py-4 shadow-md backdrop-blur-sm">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Redirecting to your DNA…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-card/40 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 gap-1.5 rounded-lg")}
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="min-w-0">
            <p className="font-heading text-sm font-semibold tracking-tight text-foreground">DNA</p>
            <p className="hidden text-[0.65rem] text-muted-foreground sm:block">
              URL in → structured context &amp; brand DNA out
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasSavedContexts && (
            <Drawer.Root
              open={isLibraryDrawerOpen}
              onOpenChange={(open) => setIsLibraryDrawerOpen(open)}
              swipeDirection="right"
            >
              <Drawer.Trigger
                type="button"
                className="lg:hidden inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur-sm"
                aria-label="Open your library"
              >
                <Library className="size-3" />
                Library
                <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 font-mono text-[0.6rem] text-foreground">
                  {savedContexts.length}
                </span>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
                <Drawer.Viewport>
                  <Drawer.Popup>
                    <Drawer.Content className="fixed right-0 top-0 z-[60] h-[100dvh] w-[85vw] max-w-[22rem] p-0">
                      <Drawer.Title className="sr-only">Your library</Drawer.Title>
                      <LibrarySection
                        savedContexts={savedContexts}
                        deleteFormAction={deleteFormAction}
                        deletePending={deletePending}
                        wrapperClassName="flex h-full min-h-0 flex-col border-l border-border/70 bg-card"
                        onNavigate={() => setIsLibraryDrawerOpen(false)}
                      />
                    </Drawer.Content>
                  </Drawer.Popup>
                </Drawer.Viewport>
              </Drawer.Portal>
            </Drawer.Root>
          )}

          <span className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground sm:inline-flex">
            <Sparkles className="size-3" />
            Live capture
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Main content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain lg:overflow-y-hidden lg:flex-[1.2]">
          <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            {/* Steps strip */}
            <div className="mb-8 flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-4 py-2.5 shadow-sm sm:gap-3">
              {processSteps.map((step, stepIndex) => (
                <div key={step.stepNumber} className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[0.55rem] font-bold tabular-nums text-muted-foreground ring-1 ring-border/70">
                    {step.stepNumber}
                  </span>
                  <span className="hidden truncate text-xs font-medium text-muted-foreground sm:block">
                    {step.label}
                  </span>
                  {stepIndex < processSteps.length - 1 && (
                    <div className="ml-auto h-px w-4 shrink-0 bg-border/60 sm:w-6" aria-hidden />
                  )}
                </div>
              ))}
            </div>

            {/* Heading */}
            <div className="mb-8 space-y-3">
              <span className="gradient-pill text-[0.6rem] tracking-[0.14em]">Step 1 of 3</span>
              <h1 className="font-heading text-balance text-2xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-3xl lg:text-[2rem]">
                Drop your website link.
              </h1>
              <p className="max-w-[48ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
                A real browser session, then one structured result — identity assets, voice, and
                typography you can trust for downstream workflows.
              </p>
            </div>

            {/* URL input */}
            <form action={formAction} className="space-y-3">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Website URL
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <label className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-background px-3 shadow-sm transition-[box-shadow,border-color] focus-within:border-foreground/20 focus-within:ring-2 focus-within:ring-ring/40">
                  <Globe className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  <Input
                    name="url"
                    type="url"
                    placeholder="https://yoursite.com"
                    required
                    disabled={scrapePending}
                    className="h-12 border-0 bg-transparent text-base shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0 sm:text-[1.0625rem]"
                  />
                </label>
                <Button
                  type="submit"
                  disabled={scrapePending}
                  className="h-12 shrink-0 rounded-xl px-7 text-sm font-semibold sm:min-w-[10rem] sm:text-base"
                >
                  {scrapePending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Capturing…
                    </>
                  ) : (
                    "Retrieve context"
                  )}
                </Button>
              </div>
            </form>

            {error && (
              <div className="mt-5 flex gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Library sidebar (desktop) */}
        {hasSavedContexts && (
          <LibrarySection
            savedContexts={savedContexts}
            deleteFormAction={deleteFormAction}
            deletePending={deletePending}
            wrapperClassName="hidden lg:flex max-h-[min(38vh,19rem)] min-h-0 shrink-0 flex-col border-t border-border/60 bg-muted/10 md:max-h-none lg:w-[22rem] lg:shrink-0 lg:border-l lg:border-t-0 xl:w-[24rem]"
            onNavigate={() => {}}
          />
        )}
      </div>
    </div>
  );
}

export function ScrapeForm({ savedContexts }: { savedContexts: SavedContextSummary[] }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrapeFormInner savedContexts={savedContexts} />
    </div>
  );
}
