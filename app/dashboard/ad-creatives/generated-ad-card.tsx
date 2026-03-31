"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Download, ExternalLink, ImageIcon, Loader2, RefreshCw, Sparkles } from "lucide-react";
import type {
  AdImageGenerationMode,
  GeneratedAdPrompt,
  GenerateImageState,
  StudioSlotOutcomePersisted,
} from "@/types/ad-creatives";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { APHILIO_GA_EVENTS } from "@/lib/analytics/events";
import { trackGaEvent } from "@/lib/analytics/track-client";
import { postAdCreativeGenerateImage } from "@/lib/ad-creatives/post-ad-creative-generate-image-client";
import { ErrorBanner } from "./error-banner";
import { CreativeSummaryBlock } from "./creative-summary-block";
import { QualityToggle } from "./quality-toggle";

function buildInitialImageState(
  prompt: GeneratedAdPrompt,
  initialSlot: StudioSlotOutcomePersisted | undefined,
): GenerateImageState {
  if (initialSlot?.status === "success" && initialSlot.imageUrl) {
    return {
      status: "success",
      imageUrl: initialSlot.imageUrl,
      referenceImageUrls: prompt.referenceImageUrls,
      creativeId: initialSlot.creativeId,
    };
  }
  if (initialSlot?.status === "error" && initialSlot.errorMessage) {
    return { status: "error", message: initialSlot.errorMessage };
  }
  return { status: "idle" };
}

export function GeneratedAdCard({
  prompt,
  contextId,
  studioSessionId,
  slotIndex,
  initialSlot,
  onSlotUpdate,
  onCreditPending,
  onCreditReverted,
  creditCostStoredUnitsByMode,
}: {
  prompt: GeneratedAdPrompt;
  contextId: string;
  studioSessionId: string;
  slotIndex: number;
  initialSlot?: StudioSlotOutcomePersisted;
  onSlotUpdate?: (slotIndex: number, outcome: StudioSlotOutcomePersisted) => void;
  onCreditPending?: (storedUnits: number) => void;
  onCreditReverted?: (storedUnits: number) => void;
  creditCostStoredUnitsByMode: Record<AdImageGenerationMode, number>;
}) {
  const tGen = useTranslations("adCreatives.generatedCard");
  const tCommon = useTranslations("common");
  const [imageState, setImageState] = useState<GenerateImageState>(() =>
    buildInitialImageState(prompt, initialSlot),
  );
  const [generationMode, setGenerationMode] = useState<AdImageGenerationMode>("fast");
  const [isGenerating, setIsGenerating] = useState(false);
  const [regenerateErrorMessage, setRegenerateErrorMessage] = useState<string | null>(null);

  async function runImageGeneration(formData: FormData): Promise<void> {
    const hadImageBefore = imageState.status === "success";
    const modeFromForm = String(formData.get("imageModel") ?? "fast") as AdImageGenerationMode;
    const aspectRatioFromForm = String(formData.get("aspectRatio") ?? prompt.aspectRatio);
    const storedUnits = creditCostStoredUnitsByMode[modeFromForm];

    trackGaEvent(APHILIO_GA_EVENTS.adStudioImageGenerationStart, {
      slot_index: slotIndex,
      image_mode: modeFromForm,
      aspect_ratio: aspectRatioFromForm,
    });

    function handleGenerationError(message: string): void {
      onCreditReverted?.(storedUnits);
      trackGaEvent(APHILIO_GA_EVENTS.adStudioImageGenerationError, {
        slot_index: slotIndex,
        image_mode: modeFromForm,
      });
      if (hadImageBefore) {
        setRegenerateErrorMessage(message);
      } else {
        setImageState({ status: "error", message });
      }
    }

    try {
      const nextState = await postAdCreativeGenerateImage(formData);

      if (nextState.status === "success") {
        setImageState(nextState);
        trackGaEvent(APHILIO_GA_EVENTS.adStudioImageGenerationComplete, {
          slot_index: slotIndex,
          image_mode: modeFromForm,
          aspect_ratio: aspectRatioFromForm,
        });
      } else if (nextState.status === "error") {
        handleGenerationError(nextState.message);
      }
    } catch {
      handleGenerationError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  useEffect(() => {
    if (imageState.status === "success") {
      onSlotUpdate?.(slotIndex, {
        status: "success",
        imageUrl: imageState.imageUrl,
        creativeId: imageState.creativeId,
      });
      return;
    }
    if (imageState.status === "error") {
      onSlotUpdate?.(slotIndex, {
        status: "error",
        errorMessage: imageState.message,
      });
    }
  }, [imageState, onSlotUpdate, slotIndex]);

  const hasImage = imageState.status === "success";

  function handleFormSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const modeFromForm = String(formData.get("imageModel") ?? "fast") as AdImageGenerationMode;
    setRegenerateErrorMessage(null);
    onCreditPending?.(creditCostStoredUnitsByMode[modeFromForm]);
    setIsGenerating(true);
    void runImageGeneration(formData);
  }

  return (
    <Card className="relative h-fit w-full min-w-0 overflow-hidden rounded-2xl border-border/50 bg-card/90 shadow-md ring-1 ring-border/30">
      {isGenerating && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/85 backdrop-blur-sm">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Sparkles className="size-5 animate-pulse text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{tGen("generating")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {generationMode === "premium"
                ? tGen("generatingHintPremium")
                : tGen("generatingHintFast")}
            </p>
          </div>
          <Loader2 className="size-4 animate-spin text-primary/60" />
        </div>
      )}

      <CardHeader className="space-y-2 border-b border-border/40 bg-gradient-to-b from-muted/15 to-transparent px-4 pb-3 pt-4 sm:px-5">
        <CardTitle className="text-sm font-semibold leading-snug sm:text-base">{prompt.headline}</CardTitle>
        <CreativeSummaryBlock prompt={prompt} />
      </CardHeader>

      {hasImage && (
        <>
          <figure className="m-0">
            <img
              src={imageState.imageUrl}
              alt={prompt.headline}
              className="block h-auto w-full"
            />
          </figure>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/30 px-4 py-2.5 sm:px-5">
            <a
              href={imageState.imageUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground",
              )}
            >
              <Download className="mr-1.5 size-3.5" aria-hidden />
              {tGen("download")}
            </a>
            <a
              href={imageState.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground",
              )}
            >
              <ExternalLink className="mr-1.5 size-3.5" aria-hidden />
              {tGen("fullSize")}
            </a>
          </div>
        </>
      )}

      <CardContent className="flex flex-col gap-3.5 p-4 sm:p-5">
        <form className="flex flex-col gap-3.5" onSubmit={handleFormSubmit}>
          <input type="hidden" name="filledPrompt" value={prompt.filledPrompt} />
          <input type="hidden" name="contextId" value={contextId} />
          <input type="hidden" name="studioSessionId" value={studioSessionId} />
          <input type="hidden" name="slotIndex" value={String(slotIndex)} />
          <input type="hidden" name="headline" value={prompt.headline} />
          <input type="hidden" name="subheadline" value={prompt.subheadline ?? ""} />
          <input type="hidden" name="templateLabel" value={prompt.templateLabel} />
          <input type="hidden" name="aspectRatio" value={prompt.aspectRatio} />
          <input type="hidden" name="referenceImageUrls" value={JSON.stringify(prompt.referenceImageUrls)} />
          <input type="hidden" name="referenceImageGroups" value={JSON.stringify(prompt.referenceImageGroups)} />
          <input type="hidden" name="imageModel" value={generationMode} />

          <QualityToggle
            mode={generationMode}
            onChange={setGenerationMode}
            qualityLabel={tGen("quality")}
            fastLabel={tCommon("fast")}
            premiumLabel={tCommon("premium")}
          />

          <Button type="submit" disabled={isGenerating} className="h-10 w-full rounded-xl text-sm font-semibold">
            {hasImage ? (
              <RefreshCw className="mr-2 size-4" aria-hidden />
            ) : (
              <ImageIcon className="mr-2 size-4" aria-hidden />
            )}
            {hasImage ? tGen("regenerateImage") : tGen("generateImage")}
          </Button>
        </form>

        {imageState.status === "error" && <ErrorBanner message={imageState.message} />}
        {regenerateErrorMessage && <ErrorBanner message={regenerateErrorMessage} />}
      </CardContent>
    </Card>
  );
}
