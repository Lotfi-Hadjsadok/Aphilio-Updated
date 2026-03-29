"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export function WelcomeScreen() {
  const t = useTranslations("chat");

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 px-2 py-1 text-center sm:gap-4 md:gap-5">
      <div className="relative shrink-0">
        <div
          className="pointer-events-none absolute inset-0 scale-110 rounded-[1.5rem] bg-accent-gradient opacity-[0.1] blur-xl sm:blur-2xl"
          aria-hidden
        />
        <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-accent-gradient-subtle shadow-md ring-1 ring-border/80 sm:h-[4.25rem] sm:w-[4.25rem] md:h-20 md:w-20">
          <Image
            unoptimized
            src="/aphilio-logo.webp"
            alt="Aphilio"
            width={80}
            height={80}
            className="h-full w-full object-contain p-1.5 sm:p-2"
            priority
          />
        </div>
      </div>
      <div className="max-w-xl shrink-0 space-y-1 sm:space-y-2">
        <h2 className="font-heading text-balance text-lg font-semibold tracking-tight text-foreground sm:text-xl md:text-2xl">
          {t("welcomeTitle")}
        </h2>
        <p className="text-xs leading-snug text-muted-foreground sm:text-sm md:text-base">
          {t("welcomeSubtitle")}
        </p>
      </div>
      <div className="grid w-full max-w-2xl grid-cols-2 gap-1.5 text-left sm:gap-2 md:gap-2.5">
        {(["hero", "product", "summer", "social"] as const).map((key) => (
          <div
            key={key}
            className="group relative overflow-hidden rounded-xl border border-border/70 bg-card/80 py-2 pl-3 pr-2 text-[0.7rem] leading-tight text-muted-foreground shadow-sm transition-all duration-300 before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-accent-gradient sm:rounded-2xl sm:py-2.5 sm:pl-3.5 sm:text-xs md:text-sm"
          >
            {t(`suggestions.${key}`)}
          </div>
        ))}
      </div>
    </div>
  );
}
