"use client";

import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇩🇿" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
] as const;

export function LanguageStep({
  selectedLanguage,
  onSelect,
  pending,
}: {
  selectedLanguage: string;
  onSelect: (code: string) => void;
  pending: boolean;
}) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center">
      <div className="flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        {/* Title */}
        <div className="space-y-3">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Choose your language
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            We&apos;ll use this language when generating your ad creatives and content.
          </p>
        </div>

        {/* Language grid */}
        <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
          {LANGUAGES.map((lang, index) => (
            <button
              key={lang.code}
              type="button"
              disabled={pending}
              onClick={() => onSelect(lang.code)}
              className={cn(
                "group relative flex flex-col items-center gap-2.5 rounded-2xl border px-4 py-5 transition-all duration-200 sm:gap-3 sm:px-5 sm:py-6",
                "hover:border-foreground/20 hover:bg-card/80 hover:shadow-md hover:-translate-y-0.5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selectedLanguage === lang.code
                  ? "border-foreground/30 bg-card shadow-md ring-1 ring-foreground/10"
                  : "border-border/60 bg-background/60",
                pending && "pointer-events-none opacity-50",
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
      </div>
    </div>
  );
}
