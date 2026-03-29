"use client";

import { useActionState, useEffect, useState } from "react";
import { loadDnaForAdCreativesAction } from "@/app/actions/ad-creatives";
import type { AdStudioResumePayload } from "@/app/actions/ad-creative-studio-sessions";
import type { SavedContextSummary } from "@/types/scrape";
import type { LoadAdCreativesDnaState } from "@/types/ad-creatives";
import { DnaSelectionStep } from "./dna-selection-step";
import { AdCreativesGenerateBlock } from "./ad-creatives-generate-block";

const initialLoadIdle: LoadAdCreativesDnaState = { status: "idle" };

export function AdCreativesBrandStudioBody({
  savedContexts,
  initialLoadState,
  initialContextId,
  resumePayload,
  onReturnToBrandPicker,
  onFlowChrome,
}: {
  savedContexts: SavedContextSummary[];
  initialLoadState?: LoadAdCreativesDnaState;
  initialContextId?: string;
  resumePayload: AdStudioResumePayload | null;
  onReturnToBrandPicker: () => void;
  onFlowChrome: (meta: { hasReadyBrand: boolean; activeStudioSessionId: string | null }) => void;
}) {
  const [loadState, loadFormAction, loadPending] = useActionState(
    loadDnaForAdCreativesAction,
    initialLoadState ?? initialLoadIdle,
  );
  const [pickedContextId, setPickedContextId] = useState<string | null>(initialContextId ?? null);

  const loadError = loadState.status === "error" ? loadState.message : null;
  const readyPayload = loadState.status === "ready" ? loadState.payload : null;

  useEffect(() => {
    const ready = loadState.status === "ready" ? loadState.payload : null;
    onFlowChrome({
      hasReadyBrand: Boolean(ready),
      activeStudioSessionId: resumePayload?.sessionId ?? ready?.studioSessionId ?? null,
    });
  }, [loadState, resumePayload, onFlowChrome]);

  return readyPayload ? (
    <AdCreativesGenerateBlock
      key={readyPayload.studioSessionId ?? readyPayload.contextId}
      payload={readyPayload}
      resume={resumePayload}
      onChangeDna={onReturnToBrandPicker}
    />
  ) : (
    <DnaSelectionStep
      savedContexts={savedContexts}
      loadError={loadError}
      loadPending={loadPending}
      pickedContextId={pickedContextId}
      setPickedContextId={setPickedContextId}
      loadFormAction={loadFormAction}
    />
  );
}
