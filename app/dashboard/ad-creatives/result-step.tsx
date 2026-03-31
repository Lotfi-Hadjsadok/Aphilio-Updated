"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Coins, Loader2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  AdCreativesDnaPayload,
  AdImageGenerationMode,
  GenerateAdPromptsState,
  SelectAngleState,
  SelectedTemplate,
  StudioSlotOutcomePersisted,
} from "@/types/ad-creatives";
import { Button } from "@/components/ui/button";
import { studioContentCn, studioScrollCn, studioShellCn } from "./ad-creatives-constants";
import { StepHeader } from "./step-header";
import { ErrorBanner } from "./error-banner";
import { GeneratedAdCard } from "./generated-ad-card";

export function ResultStep({
  payload,
  generateState,
  generateFormAction,
  generatePending,
  generateError,
  onBack,
  selectedSectionIds,
  selectAngleState,
  selectedTemplates,
  initialSlotOutcomes,
  initialCreditsBalanceStored,
  creditCostStoredUnitsByMode,
  journeyFurthestStep,
  onJourneyStepClick,
}: {
  payload: AdCreativesDnaPayload;
  generateState: GenerateAdPromptsState & { status: "success" };
  generateFormAction: (formData: FormData) => void;
  generatePending: boolean;
  generateError: string | null;
  onBack: () => void;
  selectedSectionIds: Set<string>;
  selectAngleState: SelectAngleState & { status: "ready" };
  selectedTemplates: SelectedTemplate[];
  initialSlotOutcomes?: StudioSlotOutcomePersisted[];
  initialCreditsBalanceStored: number;
  creditCostStoredUnitsByMode: Record<AdImageGenerationMode, number>;
  journeyFurthestStep: number;
  onJourneyStepClick: (step: number) => void;
}) {
  const t = useTranslations("adCreatives.step4");
  const sectionIdsValue = [...selectedSectionIds].join(",");
  const studioSessionId = payload.studioSessionId ?? "";

  const [balanceAdjustmentStoredUnits, setBalanceAdjustmentStoredUnits] = useState(0);
  const displayCredits = (initialCreditsBalanceStored + balanceAdjustmentStoredUnits) / 100;
  const displayCreditsFormatted = displayCredits.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const handleCreditPending = useCallback((storedUnits: number) => {
    setBalanceAdjustmentStoredUnits((prev) => prev - storedUnits);
  }, []);

  const handleCreditReverted = useCallback((storedUnits: number) => {
    setBalanceAdjustmentStoredUnits((prev) => prev + storedUnits);
  }, []);

  const promptsSignature = useMemo(
    () =>
      generateState.prompts
        .map((promptItem) => `${promptItem.templateId}:${promptItem.aspectRatio}:${promptItem.headline}`)
        .join("|"),
    [generateState.prompts],
  );

  const [slotSnapshot, setSlotSnapshot] = useState<StudioSlotOutcomePersisted[]>(() => {
    const length = generateState.prompts.length;
    const seed = initialSlotOutcomes ?? [];
    const row: StudioSlotOutcomePersisted[] = [];
    for (let index = 0; index < length; index++) {
      row[index] = seed[index] ?? { status: "pending" };
    }
    return row;
  });

  const previousPromptsSignatureRef = useRef<string | null>(null);
  useEffect(() => {
    if (previousPromptsSignatureRef.current === null) {
      previousPromptsSignatureRef.current = promptsSignature;
      return;
    }
    if (previousPromptsSignatureRef.current === promptsSignature) return;
    previousPromptsSignatureRef.current = promptsSignature;
    const length = generateState.prompts.length;
    setSlotSnapshot(() => {
      const row: StudioSlotOutcomePersisted[] = [];
      for (let index = 0; index < length; index++) {
        row[index] = { status: "pending" };
      }
      return row;
    });
  }, [promptsSignature, generateState.prompts.length]);

  const handleSlotUpdate = useCallback((slotIndex: number, outcome: StudioSlotOutcomePersisted) => {
    setSlotSnapshot((prev) => {
      const next = [...prev];
      while (next.length <= slotIndex) {
        next.push({ status: "pending" });
      }
      next[slotIndex] = outcome;
      return next;
    });
  }, []);

  return (
    <div className={studioShellCn}>
      <div className={studioScrollCn}>
        <div className={studioContentCn}>
          <div className="space-y-5 pb-12 pt-4 sm:space-y-6 sm:pb-16 sm:pt-5">
            <form action={generateFormAction} className="space-y-4">
              <input type="hidden" name="contextId" value={payload.contextId} />
              <input type="hidden" name="studioSessionId" value={studioSessionId} />
              <input
                type="hidden"
                name="selectedAngles"
                value={JSON.stringify(selectAngleState.selectedAngles)}
              />
              <input type="hidden" name="sectionIds" value={sectionIdsValue} />
              <input type="hidden" name="selectedTemplates" value={JSON.stringify(selectedTemplates)} />

              <StepHeader
                stepNumber={4}
                stepTitle={t("title")}
                stepDescription={
                  generateState.prompts.length > 1
                    ? t("layoutsReadyPlural", { count: generateState.prompts.length })
                    : t("layoutsReady", { count: generateState.prompts.length })
                }
                journeyFurthestStep={journeyFurthestStep}
                onJourneyStepClick={onJourneyStepClick}
              >
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                  <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                    <Coins className="size-3 shrink-0" aria-hidden />
                    <span className="tabular-nums">{displayCreditsFormatted} {t("credits")}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl sm:flex-none"
                    onClick={onBack}
                  >
                    <ChevronLeft className="mr-1.5 size-3.5" />
                    {t("adjustFormats")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={generatePending}
                    size="sm"
                    className="flex-1 rounded-xl sm:flex-none"
                    variant="secondary"
                  >
                    {generatePending ? (
                      <>
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        {t("refreshing")}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-1.5 size-3.5" />
                        {t("rebuildAll")}
                      </>
                    )}
                  </Button>
                </div>
              </StepHeader>

              {generateError ? <ErrorBanner message={generateError} /> : null}
            </form>

            <div className="grid w-full min-w-0 grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-2 xl:gap-7">
              {generateState.prompts.map((prompt, promptIndex) => (
                <GeneratedAdCard
                  key={`${promptsSignature}-${promptIndex}`}
                  prompt={prompt}
                  contextId={payload.contextId}
                  studioSessionId={studioSessionId}
                  slotIndex={promptIndex}
                  initialSlot={slotSnapshot[promptIndex]}
                  onSlotUpdate={handleSlotUpdate}
                  onCreditPending={handleCreditPending}
                  onCreditReverted={handleCreditReverted}
                  creditCostStoredUnitsByMode={creditCostStoredUnitsByMode}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
