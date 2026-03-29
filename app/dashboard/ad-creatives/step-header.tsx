import { cn } from "@/lib/utils";
import { TOTAL_STEPS, adStudioStepLabelPillCn } from "./ad-creatives-constants";
import { CreativeJourneyBar } from "./creative-journey-bar";

export function StepHeader({
  stepNumber,
  stepTitle,
  stepDescription,
  children,
  journeyFurthestStep,
  onJourneyStepClick,
}: {
  stepNumber: number;
  stepTitle: string;
  stepDescription: string;
  children?: React.ReactNode;
  journeyFurthestStep?: number;
  onJourneyStepClick?: (stepNumber: number) => void;
}) {
  return (
    <div className="flex min-w-0 shrink-0 flex-col gap-2.5">
      <CreativeJourneyBar
        currentStep={stepNumber}
        furthestStep={journeyFurthestStep ?? stepNumber}
        onStepClick={onJourneyStepClick}
      />

      <div className="flex min-w-0 flex-wrap items-start gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <span
            className={cn(
              "mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider",
              adStudioStepLabelPillCn,
            )}
          >
            {stepNumber}/{TOTAL_STEPS}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {stepTitle}
            </h1>
            <p className="mt-0.5 max-w-prose text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {stepDescription}
            </p>
          </div>
        </div>
        {children ? (
          <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
