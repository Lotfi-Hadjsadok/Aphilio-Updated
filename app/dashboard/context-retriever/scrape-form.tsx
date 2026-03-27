"use client";

import {
  forwardRef,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { scrapeWebsite, deleteSavedContext } from "@/app/actions/scrape";
import type { DeleteDNAState, SavedContextSummary, ScrapeState } from "@/types/scrape";
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
  Trash2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormattedDate, FORMAT_DATE_SHORT } from "@/components/formatted-date";
import { AlertDialog } from "@base-ui/react/alert-dialog";

const initialState: ScrapeState = {};
const initialDeleteState: DeleteDNAState = {};

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
              Delete this capture?
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

const LibrarySection = forwardRef<
  HTMLAsideElement,
  {
    savedContexts: SavedContextSummary[];
    deleteFormAction: (formData: FormData) => void | Promise<void>;
    deletePending: boolean;
    wrapperClassName: string;
    onNavigate: () => void;
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
  }
>(function LibrarySection(
  {
    savedContexts,
    deleteFormAction,
    deletePending,
    wrapperClassName,
    onNavigate,
    expanded,
    onExpandedChange,
  },
  ref,
) {
  const dnaCountLabel = `${savedContexts.length} saved DNA profile${savedContexts.length === 1 ? "" : "s"}`;

  const headerRow = (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-border/70">
        <Library className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 basis-[min(100%,10rem)]">
        <p className="text-sm font-semibold text-foreground">DNA library</p>
        <p className="text-[0.65rem] text-muted-foreground">Saved brand captures</p>
      </div>
      <span
        className="shrink-0 whitespace-nowrap rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium tabular-nums text-muted-foreground ring-1 ring-border/60"
        title={dnaCountLabel}
      >
        {savedContexts.length} {savedContexts.length === 1 ? "DNA" : "DNAs"}
      </span>
    </>
  );

  return (
    <aside ref={ref} className={wrapperClassName}>
      {expanded ? (
        <>
          <div className="shrink-0 border-b border-border/50 px-4 py-3.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-3">
              {headerRow}
              <button
                type="button"
                onClick={() => onExpandedChange(false)}
                aria-expanded
                aria-label="Collapse DNA library"
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon-sm" }),
                  "shrink-0 rounded-lg border-border/60 bg-background/80",
                )}
              >
                <ChevronUp className="size-4 text-muted-foreground" aria-hidden />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain p-3">
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
        </>
      ) : (
        <button
          type="button"
          onClick={() => onExpandedChange(true)}
          aria-expanded={false}
          aria-label="Expand DNA library"
          className={cn(
            "flex w-full shrink-0 flex-col px-4 py-3.5 text-left outline-none transition-colors",
            "rounded-2xl hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-3">
            {headerRow}
            <span
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" }),
                "pointer-events-none shrink-0 rounded-lg border-border/60 bg-background/80",
              )}
              aria-hidden
            >
              <ChevronDown className="size-4 text-muted-foreground" />
            </span>
          </div>
        </button>
      )}
    </aside>
  );
});

LibrarySection.displayName = "LibrarySection";

function ScrapeFormInner({ savedContexts }: { savedContexts: SavedContextSummary[] }) {
  const [scrapeState, formAction, scrapePending] = useActionState(scrapeWebsite, initialState);
  const router = useRouter();
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteSavedContext,
    initialDeleteState,
  );
  useEffect(() => {
    if (deleteState.deletedContextId) router.push("/dashboard/dna");
  }, [deleteState.deletedContextId, router]);

  const result = scrapeState.result;
  const error = result ? undefined : scrapeState.error;
  const hasSavedContexts = savedContexts.length > 0;
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);
  const libraryPanelRef = useRef<HTMLAsideElement>(null);

  const [navigatedToResult, setNavigatedToResult] = useState(false);
  useEffect(() => {
    if (!result?.id || navigatedToResult) return;
    setNavigatedToResult(true);
    router.push(`/dashboard/dna/${result.id}`);
  }, [navigatedToResult, result?.id, router]);

  useEffect(() => {
    if (!isLibraryExpanded || !hasSavedContexts) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (libraryPanelRef.current?.contains(target)) return;
      if (target instanceof Element) {
        if (target.closest("[aria-modal='true']")) return;
        if (target.closest('[role="dialog"]')) return;
        if (target.closest('[role="alertdialog"]')) return;
      }
      setIsLibraryExpanded(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isLibraryExpanded, hasSavedContexts]);

  if (result) {
    return (
      <div className="flex min-h-0 w-full flex-1 items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/50 px-5 py-4 shadow-md backdrop-blur-sm">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Opening your DNA preview…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <Link
        href="/dashboard"
        aria-label="Dashboard"
        className={cn(
          buttonVariants({ variant: "outline", size: "icon-lg" }),
          "absolute left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] z-20 shrink-0 rounded-xl border-border/60 bg-card/80 shadow-sm backdrop-blur-md",
        )}
      >
        <ArrowLeft className="size-3.5" />
      </Link>

      {hasSavedContexts && (
        <LibrarySection
          ref={libraryPanelRef}
          savedContexts={savedContexts}
          deleteFormAction={deleteFormAction}
          deletePending={deletePending}
          expanded={isLibraryExpanded}
          onExpandedChange={setIsLibraryExpanded}
          wrapperClassName={cn(
            "absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-20 flex w-[min(22rem,calc(100vw-5.5rem))] min-h-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-lg backdrop-blur-xl",
            isLibraryExpanded && "max-h-[min(50vh,22rem)]",
          )}
          onNavigate={() => {}}
        />
      )}

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="glow-orb absolute -left-24 top-8 h-72 w-72 bg-accent-gradient opacity-[0.12]" />
          <div className="glow-orb absolute -right-16 bottom-16 h-56 w-56 bg-accent-gradient opacity-[0.1]" />
        </div>

        <div
          className={cn(
            "relative flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-10 sm:px-8 sm:pb-12",
            "pt-[max(4.5rem,env(safe-area-inset-top))]",
          )}
        >
          <div className="mb-6 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient-subtle shadow-lg ring-1 ring-border/60 sm:h-20 sm:w-20">
            <Globe className="h-8 w-8 text-foreground sm:h-10 sm:w-10" strokeWidth={1.5} />
          </div>

          <div className="mb-8 w-full max-w-2xl space-y-3 text-center">
            <h1 className="font-heading text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Drop your website link
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              DNA captures branding from your URL — colors, typography, logos, and voice — using a real browser session.
            </p>
          </div>

          <form action={formAction} className="w-full max-w-lg shrink-0 space-y-4">
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 shadow-sm transition-all focus-within:border-foreground/20 focus-within:ring-2 focus-within:ring-ring/40 focus-within:shadow-md">
              <Globe className="size-5 shrink-0 text-muted-foreground/60" aria-hidden />
              <Input
                name="url"
                type="url"
                placeholder="https://yoursite.com"
                required
                disabled={scrapePending}
                className="h-14 border-0 bg-transparent text-base shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0 sm:text-lg"
              />
            </label>
            <Button
              type="submit"
              disabled={scrapePending}
              size="lg"
              className="mx-auto flex h-13 w-full max-w-xs rounded-xl px-8 text-base font-semibold sm:h-14"
            >
              {scrapePending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Extracting…
                </>
              ) : (
                "Extract DNA"
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-5 flex w-full max-w-lg shrink-0 gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3.5 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
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
