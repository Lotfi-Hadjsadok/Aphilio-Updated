"use client";

import { useRouter } from "next/navigation";
import type { SavedContextSummary } from "@/types/scrape";
import type { AdImageGenerationMode, LoadAdCreativesDnaState } from "@/types/ad-creatives";
import type {
  AdStudioResumePayload,
  AdStudioSessionListItem,
} from "@/app/actions/ad-creative-studio-sessions";
import { AdCreativesFormInner } from "./ad-creatives-form-inner";

export function AdCreativesForm({
  savedContexts,
  initialStudioSessions,
  initialContextId,
  initialLoadState,
  resumePayload,
  resumeLoadError,
  currentLocale,
  initialCreditsBalanceStored,
  creditCostStoredUnitsByMode,
}: {
  savedContexts: SavedContextSummary[];
  initialStudioSessions: AdStudioSessionListItem[];
  initialContextId?: string;
  initialLoadState?: LoadAdCreativesDnaState;
  resumePayload: AdStudioResumePayload | null;
  resumeLoadError: string | null;
  currentLocale: string;
  initialCreditsBalanceStored: number;
  creditCostStoredUnitsByMode: Record<AdImageGenerationMode, number>;
}) {
  const router = useRouter();

  return (
    <AdCreativesFormInner
      savedContexts={savedContexts}
      initialStudioSessions={initialStudioSessions}
      initialContextId={initialContextId}
      initialLoadState={initialLoadState}
      resumePayload={resumePayload}
      resumeLoadError={resumeLoadError}
      currentLocale={currentLocale}
      initialCreditsBalanceStored={initialCreditsBalanceStored}
      creditCostStoredUnitsByMode={creditCostStoredUnitsByMode}
      onChangeDnaRequest={() => {
        router.replace("/dashboard/ad-creatives");
      }}
      onOpenSession={(studioSessionId) => {
        router.push(`/dashboard/ad-creatives?sessionId=${encodeURIComponent(studioSessionId)}`);
      }}
    />
  );
}
