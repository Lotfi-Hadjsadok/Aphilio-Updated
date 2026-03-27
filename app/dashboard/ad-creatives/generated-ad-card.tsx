"use client";

import { useActionState, useState } from "react";
import { ImageIcon, Loader2, Maximize2, Sparkles, Type, Zap } from "lucide-react";
import type { AdImageGenerationMode, GeneratedAdPrompt, GenerateImageState } from "@/types/ad-creatives";
import { generateImageFromPromptAction } from "@/app/actions/ad-creatives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ErrorBanner } from "./error-banner";

const initialImageState: GenerateImageState = { status: "idle" };

export function GeneratedAdCard({
  prompt,
  contextId,
}: {
  prompt: GeneratedAdPrompt;
  contextId: string;
}) {
  const [imageState, imageFormAction, imagePending] = useActionState(
    generateImageFromPromptAction,
    initialImageState,
  );
  const [generationMode, setGenerationMode] = useState<AdImageGenerationMode>("premium");

  return (
    <Card className="overflow-hidden bg-card/80">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            {/* Template label + aspect ratio badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="text-[0.65rem]">
                {prompt.templateLabel}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 text-[0.65rem]">
                <Maximize2 className="size-2.5" />
                {prompt.aspectRatio}
              </Badge>
            </div>

            {/* Headline */}
            <CardTitle className="text-base leading-snug">{prompt.headline}</CardTitle>

            {/* Subheadline */}
            {prompt.subheadline ? (
              <p className="text-sm text-muted-foreground">{prompt.subheadline}</p>
            ) : null}

            {/* Description */}
            {prompt.description ? (
              <p className="text-xs text-muted-foreground/70">{prompt.description}</p>
            ) : null}
          </div>
        </div>

        {/* Branding strip */}
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border/40 bg-muted/10 px-2.5 py-2">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            <span
              className="size-3.5 rounded-full border border-border/60 shadow-sm"
              style={{ background: prompt.primaryColor }}
              aria-label={`Primary color ${prompt.primaryColor}`}
            />
            {prompt.accentColor ? (
              <span
                className="size-3.5 rounded-full border border-border/60 shadow-sm"
                style={{ background: prompt.accentColor }}
                aria-label={`Accent color ${prompt.accentColor}`}
              />
            ) : null}
            <span className="font-mono text-[0.6rem] text-muted-foreground">{prompt.primaryColor}</span>
            {prompt.accentColor ? (
              <span className="font-mono text-[0.6rem] text-muted-foreground">{prompt.accentColor}</span>
            ) : null}
          </div>

          {/* Divider */}
          <span className="h-3 w-px bg-border/60" aria-hidden />

          {/* Font style */}
          <div className="flex min-w-0 items-center gap-1">
            <Type className="size-2.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-[0.65rem] text-muted-foreground">{prompt.fontStyle}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Reference images (grouped by context section when available) */}
        {prompt.referenceImageGroups.length > 0 ? (
          <div className="space-y-3">
            <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              Reference images
            </p>
            {prompt.referenceImageGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <p className="mb-1 text-[0.65rem] font-medium text-muted-foreground">
                  {group.sectionTitle}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.imageUrls.map((url, refIndex) => (
                    <div
                      key={refIndex}
                      className="h-12 w-12 overflow-hidden rounded-md border border-border/50 bg-muted/20"
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : prompt.referenceImageUrls.length > 0 ? (
          <div>
            <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              Reference images
            </p>
            <div className="flex flex-wrap gap-1.5">
              {prompt.referenceImageUrls.map((url, refIndex) => (
                <div
                  key={refIndex}
                  className="h-12 w-12 overflow-hidden rounded-md border border-border/50 bg-muted/20"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Image prompt */}
        <div>
          <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
            Image prompt
          </p>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border/60 bg-muted/15 p-3 text-[0.7rem] leading-relaxed text-foreground sm:text-xs">
            {prompt.filledPrompt}
          </pre>
        </div>

        {/* Generate image form */}
        <form action={imageFormAction}>
          <input type="hidden" name="filledPrompt" value={prompt.filledPrompt} />
          <input type="hidden" name="contextId" value={contextId} />
          <input type="hidden" name="headline" value={prompt.headline} />
          <input type="hidden" name="subheadline" value={prompt.subheadline ?? ""} />
          <input type="hidden" name="templateLabel" value={prompt.templateLabel} />
          <input type="hidden" name="aspectRatio" value={prompt.aspectRatio} />
          <input
            type="hidden"
            name="referenceImageUrls"
            value={JSON.stringify(prompt.referenceImageUrls)}
          />
          <input
            type="hidden"
            name="referenceImageGroups"
            value={JSON.stringify(prompt.referenceImageGroups)}
          />
          <input type="hidden" name="imageModel" value={generationMode} />

          {/* Generation mode selector */}
          <div className="mb-3 space-y-1.5">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              Generation mode
            </p>
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-border/50 bg-muted/10 p-1">
              <button
                type="button"
                onClick={() => setGenerationMode("premium")}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-all",
                  generationMode === "premium"
                    ? "bg-background shadow-sm ring-1 ring-border/40"
                    : "hover:bg-muted/20",
                )}
              >
                <span className="flex items-center gap-1 text-xs font-semibold">
                  <Sparkles className="size-3 shrink-0" />
                  Premium
                </span>
                <span className="text-[0.6rem] leading-snug text-muted-foreground">
                  Preserves your images 100%
                </span>
              </button>
              <button
                type="button"
                onClick={() => setGenerationMode("fast")}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-all",
                  generationMode === "fast"
                    ? "bg-background shadow-sm ring-1 ring-border/40"
                    : "hover:bg-muted/20",
                )}
              >
                <span className="flex items-center gap-1 text-xs font-semibold">
                  <Zap className="size-3 shrink-0" />
                  Fast
                </span>
                <span className="text-[0.6rem] leading-snug text-muted-foreground">
                  Faster, lighter model
                </span>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={imagePending}
            className="w-full rounded-xl"
            variant={imageState.status === "success" ? "outline" : "default"}
          >
            {imagePending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Generating image…
              </>
            ) : imageState.status === "success" ? (
              <>
                <Sparkles className="mr-2 size-4" />
                Regenerate image
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 size-4" />
                Generate image
              </>
            )}
          </Button>
        </form>

        {imageState.status === "error" ? (
          <ErrorBanner message={imageState.message} />
        ) : null}

        {imageState.status === "success" ? (
          <div className="space-y-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
              Generated ad
            </p>
            <div className="flex justify-center rounded-xl border border-border/60 bg-muted/10 p-2">
              <img
                src={imageState.imageUrl}
                alt="Generated ad creative"
                className="h-auto max-h-[min(28rem,60vh)] w-full max-w-md rounded-lg object-contain"
              />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
