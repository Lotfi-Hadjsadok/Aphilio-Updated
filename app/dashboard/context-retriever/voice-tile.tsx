"use client";

import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import {
  Fingerprint,
  Heart,
  MessageSquare,
  Megaphone,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BrandingPersonality } from "@/types/scrape";
import { BentoTile } from "./bento-tile";
import { TileLabel } from "./tile-label";
import { TraitPill } from "./trait-pill";

export function VoiceTile({
  personality,
}: {
  personality: BrandingPersonality | null;
}) {
  const tCtx = useTranslations("dna.contextResult");
  const traits: {
    icon: ComponentType<{ className?: string; strokeWidth?: number }>;
    label: string;
    value: string;
  }[] = personality
    ? [
        { icon: MessageSquare, label: tCtx("traitTone"), value: personality.tone },
        { icon: Zap, label: tCtx("traitEnergy"), value: personality.energy },
        { icon: Users, label: tCtx("traitAudience"), value: personality.audience },
        ...(personality.voice
          ? [{ icon: Megaphone, label: tCtx("traitVoice"), value: personality.voice }]
          : []),
        ...(personality.archetype
          ? [{ icon: Fingerprint, label: tCtx("traitArchetype"), value: personality.archetype }]
          : []),
      ]
    : [];

  return (
    <BentoTile
      label={tCtx("voicePersonalityAria")}
      className="flex flex-col overflow-hidden sm:col-span-2"
    >
      <div className="border-b border-border/40 bg-gradient-to-br from-violet-500/[0.04] via-transparent to-sky-500/[0.05]">
        <TileLabel icon={Sparkles}>{tCtx("voicePersonalityHeading")}</TileLabel>
        {personality ? (
          <div className="grid grid-cols-1 gap-4 p-5 pt-3 sm:grid-cols-2 sm:p-6 sm:pt-3 xl:grid-cols-3">
            {traits.map((trait, traitIndex) => (
              <TraitPill
                key={`${trait.label}-${traitIndex}`}
                icon={trait.icon}
                label={trait.label}
                value={trait.value}
                accentIndex={traitIndex}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 pb-8 pt-2">
            <p className="text-center text-sm text-muted-foreground">
              {tCtx("noPersonalityData")}
            </p>
          </div>
        )}
      </div>

      {personality?.valueProposition ? (
        <div className="border-b border-border/40 px-5 py-5 sm:px-6 sm:py-6">
          <div className="relative rounded-2xl border border-border/60 bg-muted/25 px-5 py-5 sm:px-6 sm:py-6">
            <MessageSquare
              className="absolute right-4 top-4 size-10 text-foreground/[0.06] sm:right-5 sm:top-5 sm:size-12"
              strokeWidth={1.25}
              aria-hidden
            />
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {tCtx("valueProposition")}
            </p>
            <p className="relative mt-3 line-clamp-4 text-base leading-relaxed text-foreground sm:text-[1.05rem] sm:leading-relaxed">
              {personality.valueProposition}
            </p>
          </div>
        </div>
      ) : null}

      {personality?.emotionalTriggers && personality.emotionalTriggers.length > 0 ? (
        <div className="bg-gradient-to-br from-rose-500/[0.07] via-background to-violet-500/[0.06] px-5 py-5 sm:px-6 sm:py-6">
          <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-background/90 shadow-sm ring-1 ring-rose-500/25">
              <Heart className="size-5 text-rose-500" strokeWidth={2} />
              <Sparkles
                className="animate-dna-sparkle absolute -right-0.5 -top-0.5 size-4 text-amber-500"
                strokeWidth={2}
                aria-hidden
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-lg font-semibold tracking-tight text-foreground">
                {tCtx("emotionalTriggers")}
              </p>
            </div>
          </div>
          <div className="relative">
            <div
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-visible overscroll-x-contain pb-2 pl-0 pr-1 pt-0.5 touch-pan-x sm:pr-2 [-ms-overflow-style:none] [scrollbar-width:thin] [scrollbar-color:oklch(0.55_0_0_/0.35)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/80 [&::-webkit-scrollbar-track]:bg-transparent"
            >
              {personality.emotionalTriggers.map((trigger, triggerIndex) => {
                const paletteIndex = triggerIndex % 3;
                const chipClass =
                  paletteIndex === 0
                    ? "border-rose-200/60 bg-gradient-to-br from-rose-500/12 to-rose-500/5 text-foreground ring-rose-500/15 dark:border-rose-500/20"
                    : paletteIndex === 1
                      ? "border-amber-200/60 bg-gradient-to-br from-amber-500/12 to-amber-500/5 text-foreground ring-amber-500/15 dark:border-amber-500/20"
                      : "border-violet-200/60 bg-gradient-to-br from-violet-500/12 to-violet-500/5 text-foreground ring-violet-500/15 dark:border-violet-500/20";
                return (
                  <span
                    key={`${trigger}-${triggerIndex}`}
                    className={cn(
                      "inline-flex w-fit max-w-[min(100%,24rem)] shrink-0 snap-start items-start gap-2.5 whitespace-normal rounded-2xl border px-4 py-3 text-sm font-medium leading-snug shadow-sm ring-1 ring-inset sm:text-base",
                      chipClass,
                    )}
                  >
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-background/80 font-mono text-[0.65rem] font-bold text-muted-foreground ring-1 ring-border/60">
                      {triggerIndex + 1}
                    </span>
                    <span className="line-clamp-3">{trigger}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </BentoTile>
  );
}
