"use client";

import { useActionState, useEffect, useState } from "react";
import {
  selectAngleWithSimilaritiesAction,
  generateAdPromptsAction,
} from "@/app/actions/ad-creatives";
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

export function AdCreativesGenerateBlock({
  payload,
  onChangeDna,
}: {
  payload: AdCreativesDnaPayload;
  onChangeDna: () => void;
}) {
  const [selectAngleState, selectAngleFormAction, selectAnglePending] = useActionState(
    selectAngleWithSimilaritiesAction,
    initialSelectAngleState,
  );
  const [generateState, generateFormAction, generatePending] = useActionState(
    generateAdPromptsAction,
    initialGenerateState,
  );

  const [currentStep, setCurrentStep] = useState<2 | 3 | 4>(2);
  const [pickedAngles, setPickedAngles] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<SelectedTemplate[]>([]);
  const [selectedSectionIds, setSelectedSectionIds] = useState<Set<string>>(
    () => new Set(payload.sectionOptions.map((option) => option.id)),
  );

  const toggleSection = (sectionId: string) => {
    setSelectedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  // Depend on full action state, not only `.status`. After a successful run, status
  // stays "ready" / "success" on the next submit, so `[status]` would not re-run the
  // effect and the step would not advance (user stuck after "Edit" or re-picking angles).
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
        />
      ) : null}

      {currentStep === 3 && selectAngleState.status === "ready" ? (
        <ConfigureCreativeStep
          payload={payload}
          selectAngleState={selectAngleState}
          selectedTemplates={selectedTemplates}
          setSelectedTemplates={setSelectedTemplates}
          selectedSectionIds={selectedSectionIds}
          toggleSection={toggleSection}
          generateFormAction={generateFormAction}
          generatePending={generatePending}
          generateError={generateError}
          onBack={() => setCurrentStep(2)}
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
          onBack={() => setCurrentStep(3)}
          onStartOver={onChangeDna}
          selectedSectionIds={selectedSectionIds}
          selectAngleState={selectAngleState}
          selectedTemplates={selectedTemplates}
        />
      ) : null}
    </>
  );
}
