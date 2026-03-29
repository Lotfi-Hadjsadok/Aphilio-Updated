"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LOCALE_OPTIONS } from "@/lib/locale-options";
import { cn } from "@/lib/utils";

export function LanguageStep({
  selectedLanguage,
  onSelectLanguage,
  onContinue,
  continuePending,
}: {
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
  onContinue: () => void;
  continuePending: boolean;
}) {
  const t = useTranslations("onboarding.language");
  const tCommon = useTranslations("common");

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center">
      <div className="flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        {/* Title */}
        <div className="space-y-5 sm:space-y-6">
          <h2 className="font-heading pb-4 text-2xl font-bold leading-tight tracking-tight text-foreground sm:pb-5 sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("description")}
          </p>
        </div>

        {/* Language grid — tap to preview; Continue saves and advances */}
        <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
          {LOCALE_OPTIONS.map((lang, index) => (
            <button
              key={lang.code}
              type="button"
              disabled={continuePending}
              onClick={() => onSelectLanguage(lang.code)}
              className={cn(
                "group relative flex flex-col items-center gap-2.5 rounded-2xl border px-4 py-5 transition-all duration-200 sm:gap-3 sm:px-5 sm:py-6",
                "hover:border-foreground/20 hover:bg-card/80 hover:shadow-md hover:-translate-y-0.5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selectedLanguage === lang.code
                  ? "border-foreground/30 bg-card shadow-md ring-1 ring-foreground/10"
                  : "border-border/60 bg-background/60",
                continuePending && "pointer-events-none opacity-50",
              )}
              style={{
                animationDelay: `${index * 40}ms`,
                animation: "fadeSlideIn 0.4s ease both",
              }}
            >
              <span className="text-3xl sm:text-4xl leading-none" role="img" aria-label={`${lang.label} flag`}>
                {lang.flag}
              </span>
              <span className="text-sm font-medium text-foreground sm:text-base">
                {lang.label}
              </span>
              {selectedLanguage === lang.code && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <Button
          type="button"
          size="lg"
          className="min-w-[12rem] rounded-xl"
          disabled={continuePending || !selectedLanguage}
          onClick={onContinue}
        >
          {continuePending ? tCommon("loading") : tCommon("continue")}
        </Button>
      </div>
    </div>
  );
}
