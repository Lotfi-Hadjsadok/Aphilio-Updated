"use client";

import { ChevronLeft, Loader2, Sparkles } from "lucide-react";
import type {
  AdCreativesDnaPayload,
  GenerateAdPromptsState,
  SelectAngleState,
  SelectedTemplate,
} from "@/types/ad-creatives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { stepContentCn } from "./ad-creatives-constants";
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
}: {
  payload: AdCreativesDnaPayload;
  generateState: GenerateAdPromptsState & { status: "success" };
  generateFormAction: (formData: FormData) => void;
  generatePending: boolean;
  generateError: string | null;
  onBack: () => void;
  onStartOver: () => void;
  selectedSectionIds: Set<string>;
  selectAngleState: SelectAngleState & { status: "ready" };
  selectedTemplates: SelectedTemplate[];
}) {
  const sectionIdsValue = [...selectedSectionIds].join(",");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <form action={generateFormAction} className="shrink-0">
        <input type="hidden" name="contextId" value={payload.contextId} />
        <input type="hidden" name="selectedAngles" value={JSON.stringify(selectAngleState.selectedAngles)} />
        <input type="hidden" name="sectionIds" value={sectionIdsValue} />
        <input type="hidden" name="selectedTemplates" value={JSON.stringify(selectedTemplates)} />

        <div className={cn(stepContentCn, "pb-0")}>
          <StepHeader
            stepNumber={4}
            stepTitle="Your creatives"
            stepDescription={`${generateState.prompts.length} prompt${generateState.prompts.length > 1 ? "s" : ""} generated — review and generate each ad image.`}
          >
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={onBack}>
                <ChevronLeft className="mr-1 size-3.5" />
                Edit
              </Button>
              <Button type="submit" size="sm" disabled={generatePending} className="rounded-lg">
                {generatePending ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    Regenerating…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 size-3.5" />
                    Regenerate all
                  </>
                )}
              </Button>
            </div>
          </StepHeader>

          {generateError ? <ErrorBanner message={generateError} /> : null}
        </div>
      </form>

      <div className="mx-auto min-h-0 w-full max-w-4xl flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-4 sm:px-6 [-webkit-overflow-scrolling:touch]">
        <div className="space-y-4">
          {generateState.prompts.map((prompt, promptIndex) => (
            <GeneratedAdCard key={promptIndex} prompt={prompt} contextId={payload.contextId} />
          ))}
        </div>
      </div>
    </div>
  );
}
