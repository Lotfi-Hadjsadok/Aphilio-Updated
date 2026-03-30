"use client";

import { forwardRef } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Library, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SavedContextSummary } from "@/types/scrape";
import { LibraryItem } from "./library-item";

export const DnaLibrarySidebar = forwardRef<
  HTMLDivElement,
  {
    savedContexts: SavedContextSummary[];
    deleteFormAction: (formData: FormData) => void | Promise<void>;
    deletePending: boolean;
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
  }
>(function DnaLibrarySidebar(
  { savedContexts, deleteFormAction, deletePending, expanded, onExpandedChange },
  forwardedRef,
) {
  const tDna = useTranslations("dna");

  return (
    <Dialog.Root open={expanded} onOpenChange={onExpandedChange} modal>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-[100] bg-black/45 backdrop-blur-[2px]",
            "transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
          )}
        />
        <Dialog.Viewport className="fixed inset-0 z-[101] flex justify-end p-0">
          <Dialog.Popup
            ref={forwardedRef}
            className={cn(
              "pointer-events-auto flex h-dvh max-h-dvh w-[min(22rem,calc(100vw-0.75rem))] flex-col border-l border-border/70 bg-background shadow-2xl outline-none",
              "md:w-[min(26rem,calc(100vw-3rem))]",
              "transition-transform duration-200 ease-out data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
            )}
          >
            <div className="flex min-h-0 flex-1 flex-col pt-[env(safe-area-inset-top)]">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/50 px-4 py-3.5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-border/70">
                    <Library className="size-4 text-muted-foreground" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <Dialog.Title className="text-sm font-semibold text-foreground">
                      {tDna("libraryPanelTitle")}
                    </Dialog.Title>
                    <p className="text-[0.65rem] text-muted-foreground">{tDna("libraryPanelSubtitle")}</p>
                  </div>
                </div>
                <Dialog.Close
                  type="button"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon-sm" }),
                    "shrink-0 rounded-lg text-muted-foreground hover:text-foreground",
                  )}
                  aria-label={tDna("collapseLibraryAria")}
                >
                  <X className="size-4" aria-hidden />
                </Dialog.Close>
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {savedContexts.map((savedContext) => (
                  <LibraryItem
                    key={savedContext.id}
                    savedContext={savedContext}
                    deleteFormAction={deleteFormAction}
                    deletePending={deletePending}
                    onNavigate={() => onExpandedChange(false)}
                  />
                ))}
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

DnaLibrarySidebar.displayName = "DnaLibrarySidebar";
