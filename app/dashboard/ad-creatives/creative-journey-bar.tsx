"use client";

import type { ReactNode } from "react";
import { Globe, Target, LayoutGrid, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  adStudioJourneyConnectorCompleteCn,
} from "./ad-creatives-constants";
import {
  CreativeJourneyStepNode,
  type CreativeJourneyStepItem,
} from "./creative-journey-step-node";

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
  const journeySteps: CreativeJourneyStepItem[] = [
    { step: 1, label: t("journeyStep1Label"), description: t("journeyStep1Desc"), icon: Globe },
    { step: 2, label: t("journeyStep2Label"), description: t("journeyStep2Desc"), icon: Target },
    { step: 3, label: t("journeyStep3Label"), description: t("journeyStep3Desc"), icon: LayoutGrid },
    { step: 4, label: t("journeyStep4Label"), description: t("journeyStep4Desc"), icon: Sparkles },
  ];
  const segments: ReactNode[] = [];

  journeySteps.forEach((item, stepIndex) => {
    segments.push(
      <CreativeJourneyStepNode
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
