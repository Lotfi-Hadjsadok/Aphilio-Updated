import { TOTAL_STEPS } from "./ad-creatives-constants";
import { StepIndicator } from "./step-indicator";

export function StepHeader({
  stepNumber,
  stepTitle,
  stepDescription,
  children,
}: {
  stepNumber: number;
  stepTitle: string;
  stepDescription: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2.5">
          <StepIndicator current={stepNumber} total={TOTAL_STEPS} />
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Step {stepNumber} of {TOTAL_STEPS}
          </p>
        </div>
        <h1 className="mt-1.5 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {stepTitle}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{stepDescription}</p>
      </div>
      {children}
    </div>
  );
}
