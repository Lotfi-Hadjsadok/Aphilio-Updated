"use client";

import { ChevronLeft, Loader2, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AdCreativesDnaPayload } from "@/types/ad-creatives";
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
import { AngleCard } from "./angle-card";

export function AngleSelectionStep({
  payload,
  pickedAngles,
  toggleAngle,
  selectAngleFormAction,
  selectAnglePending,
  selectAngleError,
  onBack,
  journeyFurthestStep,
  onJourneyStepClick,
}: {
  payload: AdCreativesDnaPayload;
  pickedAngles: string[];
  toggleAngle: (angle: string) => void;
  selectAngleFormAction: (formData: FormData) => void;
  selectAnglePending: boolean;
  selectAngleError: string | null;
  onBack: () => void;
  journeyFurthestStep: number;
  onJourneyStepClick: (step: number) => void;
}) {
  const t = useTranslations("adCreatives");
  const tCommon = useTranslations("common");
  const angles = payload.marketingAngles ?? [];
  const selectedAnglesJson = JSON.stringify(pickedAngles);

  return (
    <div className={studioShellCn}>
      <form action={selectAngleFormAction} className="flex min-h-0 min-w-0 flex-1 flex-col">
        <input type="hidden" name="contextId" value={payload.contextId} />
        <input type="hidden" name="studioSessionId" value={payload.studioSessionId ?? ""} />
        <input type="hidden" name="selectedAngles" value={selectedAnglesJson} />

        <div className={studioScrollCn}>
          <div className={studioContentCn}>
            <div className="space-y-3.5 pb-4 pt-4 sm:space-y-4 sm:pb-5 sm:pt-5">
              <StepHeader
                stepNumber={2}
                stepTitle={t("step2.title")}
                stepDescription={t("step2.description")}
                journeyFurthestStep={journeyFurthestStep}
                onJourneyStepClick={onJourneyStepClick}
              >
                <span className="gradient-pill h-6 shrink-0 px-2.5 text-[0.65rem] font-bold tracking-wide text-white">
                  {pickedAngles.length > 0
                    ? tCommon("selected", { count: pickedAngles.length })
                    : tCommon("options", { count: angles.length })}
                </span>
              </StepHeader>

              {angles.length === 0 ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                  {t("step2.noAngles")}
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {angles.map((angle, idx) => (
                    <AngleCard
                      key={`${idx}-${angle}`}
                      index={idx}
                      angleText={angle}
                      selected={pickedAngles.includes(angle)}
                      onToggle={() => toggleAngle(angle)}
                    />
                  ))}
                </div>
              )}

              {selectAngleError ? <ErrorBanner message={selectAngleError} /> : null}
            </div>
          </div>
        </div>

        <div className={studioFooterBarCn}>
          <div className={studioContentCn}>
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={onBack}
              >
                <ChevronLeft className="mr-1 size-3.5" />
                {tCommon("back")}
              </Button>
              <Button
                type="submit"
                disabled={selectAnglePending || pickedAngles.length === 0 || angles.length === 0}
                className={cn(
                  "min-w-[8rem] rounded-xl sm:min-w-[10rem]",
                  adStudioPrimaryButtonCn,
                )}
                size="lg"
              >
                {selectAnglePending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {tCommon("preparing")}
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 size-4" />
                    {tCommon("continue")}
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
