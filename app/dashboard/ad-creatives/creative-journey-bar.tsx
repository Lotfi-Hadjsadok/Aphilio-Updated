"use client";

import type { ReactNode } from "react";
import { Check, Globe, Target, LayoutGrid, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  adStudioJourneyConnectorCompleteCn,
  adStudioJourneyNodeCompleteCn,
  adStudioJourneyNodeCurrentCn,
  adStudioJourneyNodeIdleCn,
} from "./ad-creatives-constants";

type JourneyStepItem = {
  step: 1 | 2 | 3 | 4;
  label: string;
  description: string;
  icon: typeof Globe;
};

function StepNode({
  item,
  currentStep,
  furthestStep,
  onStepClick,
}: {
  item: JourneyStepItem;
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
          canClick && "cursor-pointer hover:scale-105 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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

export function CreativeJourneyBar({
  currentStep,
  furthestStep,
  onStepClick,
}: {
  currentStep: number;
  furthestStep: number;
  onStepClick?: (step: number) => void;
}) {
  const t = useTranslations("adCreatives");
  const journeySteps: JourneyStepItem[] = [
    { step: 1, label: t("journeyStep1Label"), description: t("journeyStep1Desc"), icon: Globe },
    { step: 2, label: t("journeyStep2Label"), description: t("journeyStep2Desc"), icon: Target },
    { step: 3, label: t("journeyStep3Label"), description: t("journeyStep3Desc"), icon: LayoutGrid },
    { step: 4, label: t("journeyStep4Label"), description: t("journeyStep4Desc"), icon: Sparkles },
  ];
  const segments: ReactNode[] = [];

  journeySteps.forEach((item, stepIndex) => {
    segments.push(
      <StepNode
        key={item.step}
        item={item}
        currentStep={currentStep}
        furthestStep={furthestStep}
        onStepClick={onStepClick}
      />,
    );
    if (stepIndex < journeySteps.length - 1) {
      const lineComplete = currentStep > item.step;
      segments.push(
        <div
          key={`line-${item.step}`}
          className="mb-auto mt-[0.875rem] h-px min-w-[4px] flex-1 sm:mt-[1rem]"
          aria-hidden
        >
          <span
            className={cn(
              "block h-full w-full rounded-full transition-colors",
              lineComplete ? adStudioJourneyConnectorCompleteCn : "bg-border/80",
            )}
          />
        </div>,
      );
    }
  });

  return (
    <div
      className="overflow-x-auto overflow-y-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label={t("journeyAria")}
    >
      <div className="flex w-full min-w-[16rem] items-start">{segments}</div>
    </div>
  );
}
