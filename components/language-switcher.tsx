"use client";

import { startTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  updatePreferredLanguageAction,
  type UpdatePreferredLanguageState,
} from "@/app/actions/locale";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { LOCALE_OPTIONS } from "@/lib/locale-options";
import { cn } from "@/lib/utils";

const initialUpdateLocaleState: UpdatePreferredLanguageState = {};

const triggerClassBase = cn(
  "w-full min-w-0 max-w-full rounded-xl border-border/60 bg-card/50 shadow-sm backdrop-blur-sm",
  "flex items-center justify-between gap-2 !py-0 px-3",
  "sm:max-w-[13rem]",
);

const triggerSizeStyles = {
  default: cn(
    "!h-9 min-h-9 text-sm",
    triggerClassBase,
  ),
  prominent: cn(
    "!h-10 min-h-10 text-sm sm:!h-11 sm:min-h-11 sm:text-base md:text-lg sm:max-w-[16rem]",
    triggerClassBase,
  ),
} as const;

export function LanguageSwitcher({
  currentLocale,
  className,
  variant = "default",
}: {
  currentLocale: string;
  className?: string;
  /** Larger control for marketing headers (home, plans). */
  variant?: "default" | "prominent";
}) {
  const router = useRouter();
  const t = useTranslations("common");
  const [updateState, submitLocale, pending] = useActionState(
    updatePreferredLanguageAction,
    initialUpdateLocaleState,
  );

  useEffect(() => {
    if (!updateState?.ok) return;
    router.refresh();
  }, [updateState?.ok, router]);

  const active = LOCALE_OPTIONS.find((item) => item.code === currentLocale);

  return (
    <div
      className={cn(
        "flex min-w-0 shrink items-center justify-center sm:shrink-0",
        variant === "prominent" ? "min-h-10 sm:min-h-11" : "min-h-9",
        className,
      )}
    >
      <Select
        value={currentLocale}
        disabled={pending}
        onValueChange={(value) => {
          if (!value || value === currentLocale) return;
          const formData = new FormData();
          formData.append("language", value);
          startTransition(() => {
            submitLocale(formData);
          });
        }}
      >
        <SelectTrigger
          aria-label={
            active
              ? `${t("interfaceLanguage")}: ${active.label}`
              : t("interfaceLanguage")
          }
          className={triggerSizeStyles[variant]}
        >
          <span className="flex min-w-0 flex-1 items-center justify-center gap-2">
            <span
              className={cn(
                "flex shrink-0 items-center justify-center leading-none",
                variant === "prominent"
                  ? "size-7 text-lg sm:size-8 sm:text-2xl md:size-9 md:text-[1.65rem]"
                  : "size-7 text-xl",
              )}
              aria-hidden
            >
              {active?.flag ?? "🌐"}
            </span>
            <span
              className={cn(
                "truncate text-center leading-tight",
                variant === "prominent"
                  ? "max-w-[min(100%,11rem)] sm:max-w-[13rem]"
                  : "max-w-[min(100%,9rem)] sm:max-w-[10rem]",
              )}
            >
              {active?.label ?? t("interfaceLanguage")}
            </span>
          </span>
        </SelectTrigger>
        <SelectContent align="end" className="max-h-[min(24rem,70dvh)]">
          {LOCALE_OPTIONS.map((item) => (
            <SelectItem key={item.code} value={item.code}>
              <span className="text-base leading-none" aria-hidden>
                {item.flag}
              </span>
              <span>{item.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** @deprecated Use `LanguageSwitcher` — same component (dropdown selector). */
export const LanguageFlagsSwitcher = LanguageSwitcher;
