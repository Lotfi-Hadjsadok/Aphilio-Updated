"use client";

import type { ComponentType } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  adStudioJourneyNodeCompleteCn,
  adStudioJourneyNodeCurrentCn,
  adStudioJourneyNodeIdleCn,
} from "./ad-creatives-constants";

export type CreativeJourneyStepItem = {
  step: 1 | 2 | 3 | 4;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

export function CreativeJourneyStepNode({
  item,
  currentStep,
  furthestStep,
  onStepClick,
}: {
  item: CreativeJourneyStepItem;
  currentStep: number;
  furthestStep: number;
  onStepClick?: (step: number) => void;
}) {
  const isComplete = currentStep > item.step;
  const isCurrent = currentStep === item.step;
  const isReachable = item.step <= furthestStep;
  const canClick = Boolean(onStepClick) && isReachable;
  const Icon = item.icon;

  return (
    <div
      className="flex w-[3.75rem] shrink-0 flex-col items-center gap-1 sm:w-[5rem] sm:gap-1.5"
      aria-current={isCurrent ? "step" : undefined}
    >
      <button
        type="button"
        disabled={!canClick}
        onClick={() => {
          if (canClick && onStepClick) onStepClick(item.step);
        }}
        className={cn(
          "flex size-7 items-center justify-center rounded-full transition-all sm:size-8",
          canClick &&
            "cursor-pointer hover:scale-105 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !canClick && "cursor-default",
          isComplete && adStudioJourneyNodeCompleteCn,
          isCurrent && !isComplete && adStudioJourneyNodeCurrentCn,
          !isComplete && !isCurrent && adStudioJourneyNodeIdleCn,
        )}
      >
        {isComplete ? (
          <Check className="size-3 sm:size-3.5" strokeWidth={2.5} />
        ) : (
          <Icon className="size-3 sm:size-3.5" strokeWidth={1.75} />
        )}
      </button>
      <div className="w-full text-center">
        <p
          className={cn(
            "text-[0.58rem] font-semibold leading-tight sm:text-[0.62rem]",
            isCurrent && "text-gradient",
            !isCurrent && isComplete && "text-foreground/80",
            !isCurrent && !isComplete && "text-muted-foreground/70",
          )}
        >
          {item.label}
        </p>
        <p className="mt-0.5 hidden text-[0.52rem] leading-snug text-muted-foreground/60 sm:block">
          {item.description}
        </p>
      </div>
    </div>
  );
}
