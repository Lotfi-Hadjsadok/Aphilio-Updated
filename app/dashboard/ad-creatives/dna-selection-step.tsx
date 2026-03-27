"use client";

import { ChevronRight, Loader2 } from "lucide-react";
import type { SavedContextSummary } from "@/types/scrape";
import { Button } from "@/components/ui/button";
import { stepContentCn } from "./ad-creatives-constants";
import { StepHeader } from "./step-header";
import { ErrorBanner } from "./error-banner";
import { DnaPickCard } from "./dna-pick-card";

export function DnaSelectionStep({
  savedContexts,
  loadError,
  loadPending,
  pickedContextId,
  setPickedContextId,
  loadFormAction,
}: {
  savedContexts: SavedContextSummary[];
  loadError: string | null;
  loadPending: boolean;
  pickedContextId: string | null;
  setPickedContextId: (id: string) => void;
  loadFormAction: (formData: FormData) => void;
}) {
  return (
    <div className={stepContentCn}>
      <StepHeader
        stepNumber={1}
        stepTitle="Choose a DNA profile"
        stepDescription="Select the brand context to ground your ad creative."
      />

      <form action={loadFormAction} className="mt-5 flex min-h-0 flex-1 flex-col">
        <input type="hidden" name="contextId" value={pickedContextId ?? ""} />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
          <div className="space-y-2">
            {savedContexts.map((savedContext) => (
              <DnaPickCard
                key={savedContext.id}
                savedContext={savedContext}
                selected={pickedContextId === savedContext.id}
                onSelect={() => setPickedContextId(savedContext.id)}
              />
            ))}
          </div>
        </div>

        {loadError ? <ErrorBanner message={loadError} /> : null}

        <div className="mt-4 flex shrink-0 items-center justify-end border-t border-border/60 pt-4">
          <Button type="submit" disabled={loadPending || !pickedContextId} className="rounded-xl">
            {loadPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading DNA…
              </>
            ) : (
              <>
                Select angles
                <ChevronRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
