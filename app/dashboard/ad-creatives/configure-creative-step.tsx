"use client";

import { ChevronLeft, Loader2, Sparkles, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AD_TEMPLATE_CATEGORIES,
  ASPECT_RATIO_OPTIONS,
  defaultAspectRatioForTemplate,
} from "@/lib/ad-creatives/templates";
import { LOCALE_OPTIONS } from "@/lib/locale-options";
import type { Locale } from "@/lib/i18n-locales";
import { studioCategoryIcon, studioTemplateIcon } from "./ad-creative-template-icons";
import type {
  AdAspectRatio,
  AdCreativesDnaPayload,
  SelectAngleState,
  SelectedTemplate,
} from "@/types/ad-creatives";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  adStudioCategoryShellCn,
  adStudioPrimaryButtonCn,
  studioContentCn,
  studioFooterBarCn,
  studioScrollCn,
  studioShellCn,
} from "./ad-creatives-constants";
import {
  studioCategoryIconIdleWrapClass,
  studioTemplateIconIdleWrapClass,
} from "./ad-studio-icon-wraps";
import { StepHeader } from "./step-header";
import { ErrorBanner } from "./error-banner";

function aspectRatioOptionSlug(value: AdAspectRatio): string {
  return value.replace(":", "_");
}

export function ConfigureCreativeStep({
  payload,
  selectAngleState,
  selectedTemplates,
  setSelectedTemplates,
  selectedSectionIds,
  outputLanguage,
  onOutputLanguageChange,
  generateFormAction,
  generatePending,
  generateError,
  onBack,
  journeyFurthestStep,
  onJourneyStepClick,
}: {
  payload: AdCreativesDnaPayload;
  selectAngleState: SelectAngleState & { status: "ready" };
  selectedTemplates: SelectedTemplate[];
  setSelectedTemplates: (templates: SelectedTemplate[]) => void;
  selectedSectionIds: Set<string>;
  outputLanguage: Locale;
  onOutputLanguageChange: (code: Locale) => void;
  generateFormAction: (formData: FormData) => void;
  generatePending: boolean;
  generateError: string | null;
  onBack: () => void;
  journeyFurthestStep: number;
  onJourneyStepClick: (step: number) => void;
}) {
  const t = useTranslations("adCreatives");
  const tCommon = useTranslations("common");
  const tCategories = useTranslations("adCreatives.categories");
  const tLayouts = useTranslations("adCreatives.layouts");
  const tAspectOpts = useTranslations("adCreatives.aspectRatioOptions");
  const activeLanguage = LOCALE_OPTIONS.find((item) => item.code === outputLanguage);
  const sectionIdsValue = [...selectedSectionIds].join(",");
  const selectedTemplatesJson = JSON.stringify(selectedTemplates);

  function isSelected(templateId: string) {
    return selectedTemplates.some((template) => template.templateId === templateId);
  }

  function getRatio(templateId: string): AdAspectRatio {
    return (
      selectedTemplates.find((template) => template.templateId === templateId)?.aspectRatio ??
      defaultAspectRatioForTemplate(templateId)
    );
  }

  function toggleTemplate(templateId: string, templateLabel: string) {
    const defaultRatio = defaultAspectRatioForTemplate(templateId);
    setSelectedTemplates(
      isSelected(templateId)
        ? selectedTemplates.filter((template) => template.templateId !== templateId)
        : [...selectedTemplates, { templateId, templateLabel, aspectRatio: defaultRatio }],
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
    <div className={studioShellCn}>
      <form action={generateFormAction} className="flex min-h-0 min-w-0 flex-1 flex-col">
        <input type="hidden" name="contextId" value={payload.contextId} />
        <input type="hidden" name="studioSessionId" value={payload.studioSessionId ?? ""} />
        <input type="hidden" name="selectedAngles" value={JSON.stringify(selectAngleState.selectedAngles)} />
        <input type="hidden" name="sectionIds" value={sectionIdsValue} />
        <input type="hidden" name="selectedTemplates" value={selectedTemplatesJson} />
        <input type="hidden" name="outputLanguage" value={outputLanguage} />

        <div className={studioScrollCn}>
          <div className={studioContentCn}>
              <div className="space-y-3.5 pb-4 pt-4 sm:space-y-4 sm:pb-5 sm:pt-5">
              <StepHeader
                stepNumber={3}
                stepTitle={t("step3.title")}
                stepDescription={t("step3.description")}
                journeyFurthestStep={journeyFurthestStep}
                onJourneyStepClick={onJourneyStepClick}
              >
                {selectedTemplates.length > 0 ? (
                  <span className="gradient-pill h-6 shrink-0 px-2.5 text-[0.65rem] font-bold tracking-wide text-white">
                    {tCommon("selected", { count: selectedTemplates.length })}
                  </span>
                ) : null}
              </StepHeader>

              <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/20 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  {tCommon("adLanguage")}
                </p>
                <Select
                  value={outputLanguage}
                  onValueChange={(value) => onOutputLanguageChange(value as Locale)}
                  disabled={generatePending}
                >
                  <SelectTrigger
                    aria-label={tCommon("adLanguageAria")}
                    className="h-10 w-full min-w-[10rem] max-w-md rounded-xl border-border bg-background/80 text-sm sm:w-auto sm:min-w-[12rem]"
                  >
                    <SelectValue>
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="text-base leading-none" aria-hidden>
                          {activeLanguage?.flag ?? "🌐"}
                        </span>
                        <span className="truncate">
                          {activeLanguage?.label ?? outputLanguage}
                        </span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {LOCALE_OPTIONS.map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        <span className="mr-1.5 text-base leading-none" aria-hidden>
                          {item.flag}
                        </span>
                        <span>{item.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {AD_TEMPLATE_CATEGORIES.map((category) => {
                  const CategoryIcon = studioCategoryIcon(category.id);
                  return (
                    <section key={category.id} className={cn(adStudioCategoryShellCn, "p-1 sm:p-1.5")}>
                      <div className="rounded-[0.875rem] bg-background/25 px-3.5 pb-3 pt-2.5 sm:px-4 sm:pb-3.5 sm:pt-3">
                        <h3 className="mb-3 flex items-center gap-2.5 border-b border-border/35 pb-2.5">
                          <span
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors",
                              studioCategoryIconIdleWrapClass(category.id),
                            )}
                            aria-hidden
                          >
                            <CategoryIcon className="size-4" strokeWidth={1.85} />
                          </span>
                          <span className="font-heading text-sm font-semibold leading-snug tracking-tight text-foreground">
                            {tCategories(category.id)}
                          </span>
                        </h3>
                        <div className="grid gap-2 sm:grid-cols-2">
                        {category.templates.map((template) => {
                          const selected = isSelected(template.id);
                          const currentRatio = getRatio(template.id);
                          const TemplateIcon = studioTemplateIcon(template.id);

                          return (
                            <div
                              key={template.id}
                              className={cn(
                                "group overflow-hidden rounded-xl border transition-all duration-200",
                                selected
                                  ? "border-primary/35 bg-gradient-to-br from-primary/[0.07] via-background/80 to-background/90 shadow-sm ring-1 ring-primary/15"
                                  : "border-border/55 bg-background/40 hover:border-primary/20 hover:bg-muted/25 hover:shadow-sm",
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => toggleTemplate(template.id, template.label)}
                                className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left sm:px-4 sm:py-3"
                              >
                                <span className="relative shrink-0" aria-hidden>
                                  <span
                                    className={cn(
                                      "flex size-8 items-center justify-center rounded-xl transition-all duration-200 ease-out",
                                      selected
                                        ? "border-0 bg-accent-gradient text-white shadow-md shadow-orange-500/20 ring-2 ring-white/30 dark:shadow-fuchsia-500/15"
                                        : studioTemplateIconIdleWrapClass(template.id),
                                    )}
                                  >
                                    {selected ? (
                                      <Check className="size-3.5" strokeWidth={2.5} />
                                    ) : (
                                      <TemplateIcon className="size-4" strokeWidth={1.85} />
                                    )}
                                  </span>
                                </span>
                                <span
                                  className={cn(
                                    "min-w-0 flex-1 text-sm font-medium leading-snug transition-colors",
                                    selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/90",
                                  )}
                                >
                                  {tLayouts(template.id)}
                                </span>
                              </button>

                              {selected ? (
                                <div className="border-t border-border/40 bg-muted/15 px-3 pb-3 pt-3 sm:px-4">
                                  <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {tCommon("aspectRatio")}
                                  </p>
                                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                                    {ASPECT_RATIO_OPTIONS.map((option) => {
                                      const ratioSlug = aspectRatioOptionSlug(option.value);
                                      const ratioLabel = tAspectOpts(`${ratioSlug}.label`);
                                      const ratioNote = tAspectOpts(`${ratioSlug}.note`);
                                      return (
                                      <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setRatio(template.id, option.value)}
                                        title={`${ratioLabel}: ${ratioNote}`}
                                        aria-label={`${ratioLabel} ${option.value}`}
                                        className={cn(
                                          "flex min-w-0 flex-col items-center justify-center rounded-xl border p-1.5 transition-all sm:p-2",
                                          currentRatio === option.value
                                            ? "border-primary/45 bg-primary/12 shadow-sm ring-1 ring-primary/25"
                                            : "border-border/55 bg-background/50 hover:border-border hover:bg-background hover:shadow-sm",
                                        )}
                                      >
                                        <div className="flex h-[2.625rem] w-full items-center justify-center sm:h-12">
                                          <span
                                            className={cn(
                                              "flex max-w-full items-center justify-center rounded-[4px] border-2 font-mono font-bold tabular-nums leading-none",
                                              currentRatio === option.value
                                                ? "border-primary/50 bg-primary/15 text-foreground"
                                                : "border-border/55 bg-muted/40 text-muted-foreground",
                                            )}
                                            style={{
                                              aspectRatio: option.value.replace(":", "/"),
                                              height: "100%",
                                              maxWidth: "100%",
                                            }}
                                          >
                                            <span className="px-0.5 text-[0.5rem] tracking-tight sm:text-[0.58rem]">
                                              {option.value}
                                            </span>
                                          </span>
                                        </div>
                                      </button>
                                    );
                                    })}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                        </div>
                      </div>
                    </section>
                  );
                })}

                {generateError ? <ErrorBanner message={generateError} /> : null}
              </div>
            </div>
          </div>
        </div>

        <div className={studioFooterBarCn}>
          <div className={studioContentCn}>
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={onBack}
              >
                <ChevronLeft className="mr-1 size-3.5" />
                {tCommon("back")}
              </Button>
              <Button
                type="submit"
                disabled={generatePending || selectedTemplates.length === 0}
                className={cn(
                  "min-w-[8rem] rounded-xl sm:min-w-[12rem]",
                  adStudioPrimaryButtonCn,
                )}
                size="lg"
              >
                {generatePending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {tCommon("preparing")}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    {selectedTemplates.length > 0
                      ? selectedTemplates.length > 1
                        ? tCommon("generatePlural", { count: selectedTemplates.length })
                        : tCommon("generate", { count: selectedTemplates.length })
                      : tCommon("selectFormat")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
