"use client";

import { ChevronRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SavedContextSummary } from "@/types/scrape";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  adStudioPrimaryButtonCn,
  studioContentCn,
  studioFooterBarCn,
  studioScrollCn,
  studioShellCn,
} from "./ad-creatives-constants";
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
  const t = useTranslations("adCreatives");
  const tCommon = useTranslations("common");

  return (
    <div className={studioShellCn}>
      <form action={loadFormAction} className="flex min-h-0 min-w-0 flex-1 flex-col">
        <input type="hidden" name="contextId" value={pickedContextId ?? ""} />

        <div className={studioScrollCn}>
          <div className={studioContentCn}>
            <div className="space-y-3.5 pb-4 pt-4 sm:space-y-4 sm:pb-5 sm:pt-5">
              <StepHeader
                stepNumber={1}
                stepTitle={t("step1.title")}
                stepDescription={t("step1.description")}
                journeyFurthestStep={1}
              />

              <div className="grid gap-2 sm:grid-cols-2">
                {savedContexts.map((savedContext) => (
                  <DnaPickCard
                    key={savedContext.id}
                    savedContext={savedContext}
                    selected={pickedContextId === savedContext.id}
                    onSelect={() => setPickedContextId(savedContext.id)}
                  />
                ))}
              </div>

              {loadError ? <ErrorBanner message={loadError} /> : null}
            </div>
          </div>
        </div>

        <div className={studioFooterBarCn}>
          <div className={studioContentCn}>
            <div className="flex items-center justify-between gap-3">
              <p className="hidden text-xs text-muted-foreground sm:block">
                {t("step1.nextHint")}
              </p>
              <Button
                type="submit"
                disabled={loadPending || !pickedContextId}
                className={cn(
                  "w-full rounded-xl sm:w-auto sm:min-w-[10rem]",
                  adStudioPrimaryButtonCn,
                )}
                size="lg"
              >
                {loadPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {tCommon("loadingBrand")}
                  </>
                ) : (
                  <>
                    {tCommon("continue")}
                    <ChevronRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
