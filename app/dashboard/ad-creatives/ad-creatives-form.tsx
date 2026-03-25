"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dna,
  Globe,
  LayoutTemplate,
  Loader2,
  Sparkles,
} from "lucide-react";
import { loadDnaForAdCreativesAction, generateAdTemplatesAction } from "@/app/actions/ad-creatives";
import type { BrandingDNA, SavedContextSummary } from "@/types/scrape";
import type {
  AdCreativesDnaPayload,
  GenerateAdTemplatesState,
  LoadAdCreativesDnaState,
} from "@/types/ad-creatives";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FormattedDate, FORMAT_DATE_SHORT } from "@/components/formatted-date";
import { saasTemplateConstants } from "@/lib/saas-template-constants";

const initialLoadState: LoadAdCreativesDnaState = { status: "idle" };
const initialGenerateState: GenerateAdTemplatesState = { status: "idle" };
const fullScreenStepContentClassName =
  "mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden px-4 py-6 sm:px-6 sm:py-8";

function resolveBrandColors(branding: BrandingDNA): { primary: string | null; secondary: string | null } {
  const colors = branding.colors as unknown;
  if (Array.isArray(colors)) {
    return { primary: colors[0] ?? null, secondary: colors[1] ?? null };
  }
  const colorsObject = colors as { primary?: string | null; secondary?: string | null };
  return { primary: colorsObject.primary ?? null, secondary: colorsObject.secondary ?? null };
}

function StepHeader({
  stepNumber,
  stepTitle,
  stepDescription,
  children,
}: {
  stepNumber: number;
  stepTitle: string;
  stepDescription: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Step {stepNumber} of 4
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {stepTitle}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">{stepDescription}</p>
      </div>
      {children}
    </div>
  );
}

function BrandingStrip({ branding, brandName }: { branding: BrandingDNA | null; brandName: string }) {
  if (!branding) {
    return (
      <p className="text-xs text-muted-foreground">
        No branding bundle on this capture-generation still uses your selected section copy.
      </p>
    );
  }

  const { primary, secondary } = resolveBrandColors(branding);
  const voice = branding.personality;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="font-heading text-sm font-semibold text-foreground">{brandName}</span>
        <div className="flex gap-1.5">
          {primary ? (
            <span
              className="size-7 rounded-lg ring-1 ring-border/60"
              style={{ backgroundColor: primary }}
              title={`Primary ${primary}`}
            />
          ) : null}
          {secondary ? (
            <span
              className="size-7 rounded-lg ring-1 ring-border/60"
              style={{ backgroundColor: secondary }}
              title={`Secondary ${secondary}`}
            />
          ) : null}
        </div>
      </div>
      <p className="max-w-xl text-[0.7rem] leading-relaxed text-muted-foreground sm:text-xs">
        <span className="font-medium text-foreground">Voice:</span> {voice.tone} · {voice.energy} ·{" "}
        {voice.audience}
      </p>
    </div>
  );
}

function DnaPickCard({
  savedContext,
  selected,
  onSelect,
}: {
  savedContext: SavedContextSummary;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border bg-background/60 px-3 py-2.5 text-left transition-colors",
        selected
          ? "border-foreground/25 bg-background ring-2 ring-foreground/15"
          : "border-border/60 hover:bg-background/90",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border/60">
        <Globe className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{savedContext.name}</span>
        <span className="mt-0.5 flex items-center gap-2 text-[0.65rem] text-muted-foreground">
          <span className="flex items-center gap-1 tabular-nums">
            <Clock className="size-2.5 opacity-70" />
            <FormattedDate date={savedContext.createdAt} options={FORMAT_DATE_SHORT} />
          </span>
        </span>
      </span>
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border border-border/70",
          selected ? "bg-foreground text-background" : "opacity-0 group-hover:opacity-100",
        )}
        aria-hidden
      >
        <Check className="size-3.5" />
      </span>
    </button>
  );
}

function TemplateToggleCard({
  templateIndex,
  description,
  aspectRatio,
  selected,
  onToggle,
}: {
  templateIndex: number;
  description: string;
  aspectRatio: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border px-3 py-3 text-left transition-colors sm:px-4 sm:py-3.5",
        selected
          ? "border-foreground/25 bg-muted/25 ring-2 ring-foreground/15"
          : "border-border/60 bg-background/40 hover:bg-background/70",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-heading text-xs font-semibold text-foreground">Template {templateIndex}</span>
        <Badge variant="secondary" className="shrink-0 text-[0.6rem]">
          {aspectRatio}
        </Badge>
      </div>
      <p className="text-[0.7rem] leading-relaxed text-muted-foreground sm:text-xs">{description}</p>
    </button>
  );
}

function SectionToggleCard({
  option,
  selected,
  onToggle,
}: {
  option: AdCreativesDnaPayload["sectionOptions"][number];
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full flex-col gap-1.5 rounded-xl border px-3 py-3 text-left transition-colors sm:px-4 sm:py-3.5",
        selected
          ? "border-foreground/25 bg-muted/25 ring-2 ring-foreground/15"
          : "border-border/60 bg-background/40 hover:bg-background/70",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="line-clamp-2 font-heading text-xs font-semibold text-foreground">{option.heading}</span>
        <Badge variant="outline" className="max-w-[40%] shrink-0 truncate text-[0.6rem]">
          {option.sourceLabel}
        </Badge>
      </div>
      <p className="line-clamp-3 text-[0.7rem] leading-relaxed text-muted-foreground sm:text-xs">{option.preview}</p>
    </button>
  );
}

function NoDnaState() {
  return (
    <div className={fullScreenStepContentClassName}>
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="w-full max-w-xl rounded-xl border border-dashed border-border/70 bg-muted/10 p-8 text-center">
          <Dna className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 font-heading text-base font-semibold text-foreground">No DNA saved yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Capture a site under DNA first, then return here to generate ad prompts from that context.
          </p>
          <Link
            href="/dashboard/dna"
            className={cn(buttonVariants({ variant: "default", size: "default" }), "mt-6 inline-flex rounded-xl")}
          >
            Go to DNA
          </Link>
        </div>
      </div>
    </div>
  );
}

function DnaSelectionStep({
  savedContexts,
  loadError,
  loadPending,
  pickedContextId,
  setPickedContextId,
  loadFormAction,
}: {
  savedContexts: SavedContextSummary[];
  loadError: string | null;
  loadPending: boolean;
  pickedContextId: string | null;
  setPickedContextId: (contextId: string) => void;
  loadFormAction: (formData: FormData) => void;
}) {
  return (
    <div className={fullScreenStepContentClassName}>
      <StepHeader
        stepNumber={1}
        stepTitle="Choose a DNA profile"
        stepDescription="Start by selecting the context to ground all generated ad prompts."
      />

      <form action={loadFormAction} className="mt-6 flex min-h-0 flex-1 flex-col">
        <input type="hidden" name="contextId" value={pickedContextId ?? ""} />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
          <div className="space-y-2">
            {savedContexts.map((savedContext) => (
              <DnaPickCard
                key={savedContext.id}
                savedContext={savedContext}
                selected={pickedContextId === savedContext.id}
                onSelect={() => setPickedContextId(savedContext.id)}
              />
            ))}
          </div>
        </div>

        {loadError ? (
          <div className="mt-2 flex gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p>{loadError}</p>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-end border-t border-border/60 pt-4">
          <Button type="submit" disabled={loadPending || !pickedContextId} className="rounded-xl">
            {loadPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading DNA…
              </>
            ) : (
              <>
                Next: Templates
                <ChevronRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function AdCreativesGenerateBlock({ payload }: { payload: AdCreativesDnaPayload }) {
  const [generateState, generateFormAction, generatePending] = useActionState(
    generateAdTemplatesAction,
    initialGenerateState,
  );
  const [currentStep, setCurrentStep] = useState<2 | 3 | 4>(2);
  const [selectedTemplateIndexes, setSelectedTemplateIndexes] = useState<Set<number>>(() => new Set());
  const [selectedSectionIds, setSelectedSectionIds] = useState<Set<string>>(
    () => new Set(payload.sectionOptions.map((option) => option.id)),
  );

  const toggleTemplate = (templateIndex: number) => {
    setSelectedTemplateIndexes((previousTemplateIndexes) => {
      const nextTemplateIndexes = new Set(previousTemplateIndexes);
      if (nextTemplateIndexes.has(templateIndex)) nextTemplateIndexes.delete(templateIndex);
      else nextTemplateIndexes.add(templateIndex);
      return nextTemplateIndexes;
    });
  };

  const toggleSection = (sectionId: string) => {
    setSelectedSectionIds((previousSectionIds) => {
      const nextSectionIds = new Set(previousSectionIds);
      if (nextSectionIds.has(sectionId)) nextSectionIds.delete(sectionId);
      else nextSectionIds.add(sectionId);
      return nextSectionIds;
    });
  };

  const templateIndexesValue = [...selectedTemplateIndexes].sort((left, right) => left - right).join(",");
  const sectionIdsValue = [...selectedSectionIds].join(",");

  useEffect(() => {
    if (generateState.status === "success") setCurrentStep(4);
  }, [generateState.status]);

  return (
    <form action={generateFormAction} className="flex h-full min-h-0 flex-1 flex-col">
      <input type="hidden" name="contextId" value={payload.contextId} />
      <input type="hidden" name="templateIndexes" value={templateIndexesValue} />
      <input type="hidden" name="sectionIds" value={sectionIdsValue} />

      {currentStep === 2 ? (
        <div className={fullScreenStepContentClassName}>
          <StepHeader
            stepNumber={2}
            stepTitle="Select ad templates"
            stepDescription="Pick the template cards you want to fill. You can select as many as you need."
          >
            <Badge variant="secondary">{selectedTemplateIndexes.size} selected</Badge>
          </StepHeader>

          <div
            className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-4 [-webkit-overflow-scrolling:touch]"
            role="region"
            aria-label="Ad template list"
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {saasTemplateConstants.map((templateDefinition, templateIndexNumber) => {
                const templateIndex = templateIndexNumber + 1;
                return (
                  <TemplateToggleCard
                    key={templateIndex}
                    templateIndex={templateIndex}
                    description={templateDefinition.description}
                    aspectRatio={templateDefinition.default_aspect_ratio}
                    selected={selectedTemplateIndexes.has(templateIndex)}
                    onToggle={() => toggleTemplate(templateIndex)}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex shrink-0 items-center justify-end gap-3 border-t border-border/60 pt-4">
            <Button
              type="button"
              onClick={() => setCurrentStep(3)}
              disabled={selectedTemplateIndexes.size === 0}
              className="rounded-xl"
            >
              Next: Section copy
              <ChevronRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      {currentStep === 3 ? (
        <div className={fullScreenStepContentClassName}>
          <StepHeader
            stepNumber={3}
            stepTitle="Select section copy"
            stepDescription="Choose the sections that feed context into generation. Branding DNA is always included."
          >
            <Badge variant="secondary">{selectedSectionIds.size} selected</Badge>
          </StepHeader>

          <div className="mt-4 shrink-0">
            <BrandingStrip branding={payload.branding} brandName={payload.name} />
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-4 [-webkit-overflow-scrolling:touch]">
            <div className="grid gap-2 sm:grid-cols-2">
              {payload.sectionOptions.map((option) => (
                <SectionToggleCard
                  key={option.id}
                  option={option}
                  selected={selectedSectionIds.has(option.id)}
                  onToggle={() => toggleSection(option.id)}
                />
              ))}
            </div>
          </div>

          {generateState.status === "error" ? (
            <div className="mt-2 flex gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3.5 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <p>{generateState.message}</p>
            </div>
          ) : null}

          <div className="mt-4 flex shrink-0 items-center justify-between gap-3 border-t border-border/60 pt-4">
            <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="rounded-xl">
              <ChevronLeft className="mr-2 size-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={generatePending || selectedTemplateIndexes.size === 0 || selectedSectionIds.size === 0}
              className="rounded-xl"
            >
              {generatePending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Filling templates…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  Generate output
                </>
              )}
            </Button>
          </div>
        </div>
      ) : null}

      {currentStep === 4 ? (
        <div className={fullScreenStepContentClassName}>
          <StepHeader
            stepNumber={4}
            stepTitle="Generated output"
            stepDescription="OpenRouter returned filled prompts using your selected DNA, templates, and section copy."
          >
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCurrentStep(3)}>
                <ChevronLeft className="mr-1 size-4" />
                Back
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={generatePending || selectedTemplateIndexes.size === 0 || selectedSectionIds.size === 0}
              >
                {generatePending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Regenerating…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Regenerate
                  </>
                )}
              </Button>
            </div>
          </StepHeader>

          <div className="mt-3 flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            <LayoutTemplate className="size-3.5" />
            <span>{selectedTemplateIndexes.size} templates selected</span>
            <span>•</span>
            <span>{selectedSectionIds.size} sections selected</span>
          </div>

          <div className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-4 [-webkit-overflow-scrolling:touch]">
            <div className="space-y-4">
              {generateState.status === "success"
                ? generateState.templates.map((template) => (
                    <Card key={template.templateIndex} size="sm" className="bg-card/80">
                      <CardHeader className="border-b border-border/50 pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <CardTitle className="text-sm">Template {template.templateIndex}</CardTitle>
                          <Badge variant="secondary">{template.defaultAspectRatio}</Badge>
                        </div>
                        <CardDescription className="text-xs">{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                          Filled prompt
                        </p>
                        <pre className="mt-2 max-h-[min(26rem,58vh)] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border/60 bg-muted/20 p-3 text-[0.7rem] leading-relaxed text-foreground sm:text-xs">
                          {template.filledPrompt}
                        </pre>
                      </CardContent>
                    </Card>
                  ))
                : null}
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function AdCreativesFormInner({
  savedContexts,
  onChangeDnaRequest,
}: {
  savedContexts: SavedContextSummary[];
  onChangeDnaRequest: () => void;
}) {
  const [loadState, loadFormAction, loadPending] = useActionState(loadDnaForAdCreativesAction, initialLoadState);
  const [pickedContextId, setPickedContextId] = useState<string | null>(null);

  const hasLibrary = savedContexts.length > 0;
  const loadError = loadState.status === "error" ? loadState.message : null;
  const readyPayload = loadState.status === "ready" ? loadState.payload : null;

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-card/40 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Dashboard"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-lg" }),
              "shrink-0 rounded-lg",
            )}
          >
            <ArrowLeft className="size-3.5" />
          </Link>
          <div className="min-w-0">
            <p className="font-heading text-sm font-semibold tracking-tight text-foreground">Ad creatives</p>
            <p className="text-[0.65rem] text-muted-foreground">
              Full-screen generation flow powered by your DNA context
            </p>
          </div>
        </div>
        {readyPayload ? (
          <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={onChangeDnaRequest}>
            Change DNA
          </Button>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {!hasLibrary ? (
          <NoDnaState />
        ) : readyPayload ? (
          <AdCreativesGenerateBlock key={readyPayload.contextId} payload={readyPayload} />
        ) : (
          <DnaSelectionStep
            savedContexts={savedContexts}
            loadError={loadError}
            loadPending={loadPending}
            pickedContextId={pickedContextId}
            setPickedContextId={setPickedContextId}
            loadFormAction={loadFormAction}
          />
        )}
      </div>
    </div>
  );
}

export function AdCreativesForm({ savedContexts }: { savedContexts: SavedContextSummary[] }) {
  const [sessionKey, setSessionKey] = useState(0);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdCreativesFormInner
        key={sessionKey}
        savedContexts={savedContexts}
        onChangeDnaRequest={() => setSessionKey((previousKey) => previousKey + 1)}
      />
    </div>
  );
}
