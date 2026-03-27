"use client";

import { useState } from "react";
import { ChevronLeft, ChevronDown, ChevronUp, Loader2, Sparkles, Target, Check } from "lucide-react";
import { AD_TEMPLATE_CATEGORIES, ASPECT_RATIO_OPTIONS } from "@/lib/ad-creatives-templates";
import type {
  AdAspectRatio,
  AdCreativesDnaPayload,
  SelectAngleState,
  SelectedTemplate,
} from "@/types/ad-creatives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { stepContentCn } from "./ad-creatives-constants";
import { StepHeader } from "./step-header";
import { ErrorBanner } from "./error-banner";
import { SectionToggleCard } from "./section-toggle-card";

export function ConfigureCreativeStep({
  payload,
  selectAngleState,
  selectedTemplates,
  setSelectedTemplates,
  selectedSectionIds,
  toggleSection,
  generateFormAction,
  generatePending,
  generateError,
  onBack,
}: {
  payload: AdCreativesDnaPayload;
  selectAngleState: SelectAngleState & { status: "ready" };
  selectedTemplates: SelectedTemplate[];
  setSelectedTemplates: (templates: SelectedTemplate[]) => void;
  selectedSectionIds: Set<string>;
  toggleSection: (id: string) => void;
  generateFormAction: (formData: FormData) => void;
  generatePending: boolean;
  generateError: string | null;
  onBack: () => void;
}) {
  const [sectionsExpanded, setSectionsExpanded] = useState(false);

  const sectionIdsValue = [...selectedSectionIds].join(",");
  const selectedTemplatesJson = JSON.stringify(selectedTemplates);

  function isSelected(templateId: string) {
    return selectedTemplates.some((template) => template.templateId === templateId);
  }

  function getRatio(templateId: string): AdAspectRatio {
    return selectedTemplates.find((template) => template.templateId === templateId)?.aspectRatio ?? "4:5";
  }

  function toggleTemplate(templateId: string, templateLabel: string) {
    setSelectedTemplates(
      isSelected(templateId)
        ? selectedTemplates.filter((template) => template.templateId !== templateId)
        : [...selectedTemplates, { templateId, templateLabel, aspectRatio: "4:5" }],
    );
  }

  function setRatio(templateId: string, aspectRatio: AdAspectRatio) {
    setSelectedTemplates(
      selectedTemplates.map((template) =>
        template.templateId === templateId ? { ...template, aspectRatio } : template,
      ),
    );
  }

  return (
    <div className={stepContentCn}>
      <StepHeader
        stepNumber={3}
        stepTitle="Choose ad formats"
        stepDescription="Pick one or more templates — each gets its own aspect ratio and a tailored prompt."
      >
        {selectedTemplates.length > 0 ? (
          <Badge variant="secondary" className="shrink-0">
            {selectedTemplates.length} selected
          </Badge>
        ) : null}
      </StepHeader>

      <div className="mt-3 shrink-0 rounded-xl border border-border/60 bg-muted/10 px-3 py-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Target className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {selectAngleState.selectedAngles.length === 1 ? "Angle:" : `Angles (${selectAngleState.selectedAngles.length}):`}
          </span>
        </div>
        <ul className="space-y-0.5">
          {selectAngleState.selectedAngles.map((angle, angleIndex) => (
            <li key={angleIndex} className="text-sm font-medium text-foreground leading-snug">
              {selectAngleState.selectedAngles.length > 1 ? (
                <span className="mr-1.5 text-xs text-muted-foreground">{angleIndex + 1}.</span>
              ) : null}
              {angle}
            </li>
          ))}
        </ul>
      </div>

      <form action={generateFormAction} className="mt-4 flex min-h-0 flex-1 flex-col">
        <input type="hidden" name="contextId" value={payload.contextId} />
        <input type="hidden" name="selectedAngles" value={JSON.stringify(selectAngleState.selectedAngles)} />
        <input type="hidden" name="sectionIds" value={sectionIdsValue} />
        <input type="hidden" name="selectedTemplates" value={selectedTemplatesJson} />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
          <div className="space-y-6">

            {/* ── Template categories ───────────────────────────────────── */}
            <div className="space-y-5">
              {AD_TEMPLATE_CATEGORIES.map((category) => (
                <section key={category.id}>
                  <p className="mb-2.5 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    {category.label}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {category.templates.map((template) => {
                      const selected = isSelected(template.id);
                      const currentRatio = getRatio(template.id);

                      return (
                        <div
                          key={template.id}
                          className={cn(
                            "rounded-xl border transition-all duration-150",
                            selected
                              ? "border-foreground/20 bg-foreground/[0.03] shadow-sm"
                              : "border-border/50 bg-background/40",
                          )}
                        >
                          {/* Template toggle row */}
                          <button
                            type="button"
                            onClick={() => toggleTemplate(template.id, template.label)}
                            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
                          >
                            <span
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded border-[1.5px] transition-all",
                                selected
                                  ? "border-foreground/60 bg-foreground/10"
                                  : "border-border/60 bg-transparent",
                              )}
                              aria-hidden
                            >
                              {selected ? (
                                <Check className="size-2.5 text-foreground" strokeWidth={3} />
                              ) : null}
                            </span>
                            <span
                              className={cn(
                                "text-xs font-medium leading-snug transition-colors",
                                selected ? "text-foreground" : "text-muted-foreground",
                              )}
                            >
                              {template.label}
                            </span>
                          </button>

                          {/* Aspect ratio row — visible only when selected */}
                          {selected ? (
                            <div className="border-t border-border/30 px-3 pb-2.5 pt-2">
                              <p className="mb-1.5 text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">
                                Ratio
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {ASPECT_RATIO_OPTIONS.map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setRatio(template.id, option.value)}
                                    className={cn(
                                      "rounded-lg border px-2 py-1 text-[0.65rem] font-medium transition-all",
                                      currentRatio === option.value
                                        ? "border-foreground/25 bg-muted/30 text-foreground ring-1 ring-foreground/15"
                                        : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground",
                                    )}
                                  >
                                    {option.value}
                                    <span className="ml-1 opacity-60">{option.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* ── Source sections (collapsible) ─────────────────────────── */}
            <div>
              <button
                type="button"
                onClick={() => setSectionsExpanded((prev) => !prev)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/10 px-3 py-2.5 text-left transition-colors hover:bg-muted/20"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Source sections
                  </span>
                  <Badge variant="secondary" className="text-[0.6rem]">
                    {selectedSectionIds.size} of {payload.sectionOptions.length}
                  </Badge>
                </div>
                {sectionsExpanded ? (
                  <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                )}
              </button>

              {sectionsExpanded ? (
                <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {payload.sectionOptions.map((option) => (
                    <SectionToggleCard
                      key={option.id}
                      option={option}
                      selected={selectedSectionIds.has(option.id)}
                      onToggle={() => toggleSection(option.id)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {generateError ? <ErrorBanner message={generateError} /> : null}

        <div className="mt-4 flex shrink-0 items-center justify-between gap-3 border-t border-border/60 pt-4">
          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={onBack}>
            <ChevronLeft className="mr-1 size-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={generatePending || selectedTemplates.length === 0 || selectedSectionIds.size === 0}
            className="rounded-xl"
          >
            {generatePending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Generating prompts…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                {selectedTemplates.length > 0
                  ? `Generate ${selectedTemplates.length} creative${selectedTemplates.length > 1 ? "s" : ""}`
                  : "Select a format"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
