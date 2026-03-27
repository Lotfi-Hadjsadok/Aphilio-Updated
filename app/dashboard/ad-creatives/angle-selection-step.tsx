"use client";

import { ChevronLeft, Loader2, Zap } from "lucide-react";
import type { AdCreativesDnaPayload } from "@/types/ad-creatives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { stepContentCn } from "./ad-creatives-constants";
import { StepHeader } from "./step-header";
import { ErrorBanner } from "./error-banner";
import { PersonalityStrip } from "./personality-strip";
import { AngleCard } from "./angle-card";

export function AngleSelectionStep({
  payload,
  pickedAngles,
  toggleAngle,
  selectAngleFormAction,
  selectAnglePending,
  selectAngleError,
  onBack,
}: {
  payload: AdCreativesDnaPayload;
  pickedAngles: string[];
  toggleAngle: (angle: string) => void;
  selectAngleFormAction: (formData: FormData) => void;
  selectAnglePending: boolean;
  selectAngleError: string | null;
  onBack: () => void;
}) {
  const angles = payload.marketingAngles ?? [];
  const selectedAnglesJson = JSON.stringify(pickedAngles);

  return (
    <div className={stepContentCn}>
      <StepHeader
        stepNumber={2}
        stepTitle="Choose your angles"
        stepDescription="Select one or more marketing angles to focus this creative on."
      >
        <Badge variant="secondary">
          {pickedAngles.length > 0 ? `${pickedAngles.length} selected` : `${angles.length} angles`}
        </Badge>
      </StepHeader>

      <div className="mt-3 shrink-0">
        <PersonalityStrip
          branding={payload.branding}
          personality={payload.personality}
          brandName={payload.name}
        />
      </div>

      {angles.length === 0 ? (
        <div className="mt-4 shrink-0 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          No marketing angles found. Re-scrape the site to generate them.
        </div>
      ) : null}

      <form action={selectAngleFormAction} className="mt-4 flex min-h-0 flex-1 flex-col">
        <input type="hidden" name="contextId" value={payload.contextId} />
        <input type="hidden" name="selectedAngles" value={selectedAnglesJson} />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
          <div className="space-y-1.5">
            {angles.map((angle, idx) => (
              <AngleCard
                key={idx}
                angle={angle}
                index={idx}
                selected={pickedAngles.includes(angle)}
                onToggle={() => toggleAngle(angle)}
              />
            ))}
          </div>
        </div>

        {selectAngleError ? <ErrorBanner message={selectAngleError} /> : null}

        <div className="mt-4 flex shrink-0 items-center justify-between gap-3 border-t border-border/60 pt-4">
          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={onBack}>
            <ChevronLeft className="mr-1 size-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={selectAnglePending || pickedAngles.length === 0 || angles.length === 0}
            className="rounded-xl"
          >
            {selectAnglePending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Extracting context…
              </>
            ) : (
              <>
                <Zap className="mr-2 size-4" />
                {pickedAngles.length > 1 ? `Find content for ${pickedAngles.length} angles` : "Find similar content"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
