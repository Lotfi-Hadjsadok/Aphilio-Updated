"use client";

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  selectAngleWithSimilaritiesAction,
  generateAdPromptsAction,
} from "@/app/actions/ad-creatives";
import { updateAdStudioSessionActiveStepAction } from "@/app/actions/ad-creative-studio-sessions";
import type { AdStudioResumePayload } from "@/app/actions/ad-creative-studio-sessions";
import type {
  AdCreativesDnaPayload,
  GenerateAdPromptsState,
  SelectAngleState,
  SelectedTemplate,
} from "@/types/ad-creatives";
import { AngleSelectionStep } from "./angle-selection-step";
import { ConfigureCreativeStep } from "./configure-creative-step";
import { ResultStep } from "./result-step";

const initialSelectAngleState: SelectAngleState = { status: "idle" };
const initialGenerateState: GenerateAdPromptsState = { status: "idle" };

function deriveInitialStep(resume: AdStudioResumePayload | null): 2 | 3 | 4 {
  if (!resume) return 2;
  let step = resume.activeStep;
  if (step === 4 && (!resume.prompts || resume.prompts.length === 0)) {
    step = resume.furthestStep >= 3 ? 3 : 2;
  }
  if (step === 3 && resume.selectAngleState.status !== "ready") {
    step = 2;
  }
  return step;
}

export function AdCreativesGenerateBlock({
  payload,
  resume,
  onChangeDna,
}: {
  payload: AdCreativesDnaPayload;
  resume: AdStudioResumePayload | null;
  onChangeDna: () => void;
}) {
  const initialSelectAngle: SelectAngleState =
    resume?.selectAngleState.status === "ready" ? resume.selectAngleState : initialSelectAngleState;
  const initialGenerate: GenerateAdPromptsState =
    resume?.prompts && resume.prompts.length > 0
      ? { status: "success", prompts: resume.prompts }
      : initialGenerateState;

  const [selectAngleState, selectAngleFormAction, selectAnglePending] = useActionState(
    selectAngleWithSimilaritiesAction,
    initialSelectAngle,
  );
  const [generateState, generateFormAction, generatePending] = useActionState(
    generateAdPromptsAction,
    initialGenerate,
  );
  const [, persistStepAction] = useActionState(updateAdStudioSessionActiveStepAction, {
    status: "idle" as const,
  });

  const [currentStep, setCurrentStep] = useState<2 | 3 | 4>(() => deriveInitialStep(resume));
  const [pickedAngles, setPickedAngles] = useState<string[]>(() => resume?.pickedAngles ?? []);
  const [selectedTemplates, setSelectedTemplates] = useState<SelectedTemplate[]>(
    () => resume?.selectedTemplates ?? [],
  );

  const allSectionIds = useMemo(
    () => new Set(payload.sectionOptions.map((option) => option.id)),
    [payload.sectionOptions],
  );

  const studioSessionId = payload.studioSessionId ?? "";

  const persistActiveStep = useCallback(
    (step: 2 | 3 | 4) => {
      if (!studioSessionId) return;
      const formData = new FormData();
      formData.set("studioSessionId", studioSessionId);
      formData.set("activeStep", String(step));
      startTransition(() => {
        persistStepAction(formData);
      });
    },
    [studioSessionId, persistStepAction],
  );

  const furthestStep = useMemo(() => {
    let max = 2;
    if (resume?.furthestStep) max = Math.max(max, resume.furthestStep);
    if (selectAngleState.status === "ready") max = Math.max(max, 3);
    if (generateState.status === "success") max = Math.max(max, 4);
    return max;
  }, [resume?.furthestStep, selectAngleState.status, generateState.status]);

  const handleJourneyStepClick = useCallback(
    (step: number) => {
      if (step === 1) {
        onChangeDna();
        return;
      }
      if (step > furthestStep) return;
      if (step === 2) {
        setCurrentStep(2);
        persistActiveStep(2);
        return;
      }
      if (step === 3) {
        if (selectAngleState.status !== "ready") return;
        setCurrentStep(3);
        persistActiveStep(3);
        return;
      }
      if (step === 4) {
        if (generateState.status !== "success") return;
        setCurrentStep(4);
        persistActiveStep(4);
      }
    },
    [
      furthestStep,
      onChangeDna,
      persistActiveStep,
      selectAngleState.status,
      generateState.status,
    ],
  );

  useEffect(() => {
    if (selectAngleState.status === "ready") setCurrentStep(3);
  }, [selectAngleState]);

  useEffect(() => {
    if (generateState.status === "success") setCurrentStep(4);
  }, [generateState]);

  const selectAngleError = selectAngleState.status === "error" ? selectAngleState.message : null;
  const generateError = generateState.status === "error" ? generateState.message : null;

  return (
    <>
      {currentStep === 2 ? (
        <AngleSelectionStep
          payload={payload}
          pickedAngles={pickedAngles}
          toggleAngle={(angle) =>
            setPickedAngles((prev) =>
              prev.includes(angle) ? prev.filter((picked) => picked !== angle) : [...prev, angle],
            )
          }
          selectAngleFormAction={selectAngleFormAction}
          selectAnglePending={selectAnglePending}
          selectAngleError={selectAngleError}
          onBack={onChangeDna}
          journeyFurthestStep={furthestStep}
          onJourneyStepClick={handleJourneyStepClick}
        />
      ) : null}

      {currentStep === 3 && selectAngleState.status === "ready" ? (
        <ConfigureCreativeStep
          payload={payload}
          selectAngleState={selectAngleState}
          selectedTemplates={selectedTemplates}
          setSelectedTemplates={setSelectedTemplates}
          selectedSectionIds={allSectionIds}
          generateFormAction={generateFormAction}
          generatePending={generatePending}
          generateError={generateError}
          onBack={() => {
            setCurrentStep(2);
            persistActiveStep(2);
          }}
          journeyFurthestStep={furthestStep}
          onJourneyStepClick={handleJourneyStepClick}
        />
      ) : null}

      {currentStep === 4 &&
      generateState.status === "success" &&
      selectAngleState.status === "ready" ? (
        <ResultStep
          payload={payload}
          generateState={generateState}
          generateFormAction={generateFormAction}
          generatePending={generatePending}
          generateError={generateError}
          onBack={() => {
            setCurrentStep(3);
            persistActiveStep(3);
          }}
          selectedSectionIds={allSectionIds}
          selectAngleState={selectAngleState}
          selectedTemplates={selectedTemplates}
          initialSlotOutcomes={resume?.slotOutcomes}
          journeyFurthestStep={furthestStep}
          onJourneyStepClick={handleJourneyStepClick}
        />
      ) : null}
    </>
  );
}
