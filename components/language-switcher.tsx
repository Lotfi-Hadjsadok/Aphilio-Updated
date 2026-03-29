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

const triggerClassName = cn(
  "!h-9 min-h-9 w-full min-w-0 max-w-full rounded-xl border-border/60 bg-card/50 text-sm shadow-sm backdrop-blur-sm",
  "flex items-center justify-between gap-2 !py-0 px-3",
  "sm:max-w-[13rem]",
);

export function LanguageSwitcher({
  currentLocale,
  className,
}: {
  currentLocale: string;
  className?: string;
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
        "flex min-h-9 min-w-0 shrink items-center justify-center sm:shrink-0",
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
          className={triggerClassName}
        >
          <span className="flex min-w-0 flex-1 items-center justify-center gap-2">
            <span
              className="flex size-7 shrink-0 items-center justify-center text-xl leading-none"
              aria-hidden
            >
              {active?.flag ?? "🌐"}
            </span>
            <span className="max-w-[min(100%,9rem)] truncate text-center leading-tight sm:max-w-[10rem]">
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
