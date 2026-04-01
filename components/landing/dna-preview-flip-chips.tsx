"use client";

import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type DnaChipContentData =
  | {
      kind: "colors";
      colors: string[];
    }
  | {
      kind: "pills";
      items: string[];
    }
  | {
      kind: "chat";
      prompts: string[];
    }
  | {
      kind: "text";
      text: string;
      textClassName: string;
    };

export type DnaChipFaceData = {
  label: string;
  borderClass: string;
  bgClass: string;
  labelColor: string;
  delay: string;
  duration: string;
  rotate: string;
  content: DnaChipContentData;
};

export type DnaPreviewFlipChipsProps = {
  chipsFront: DnaChipFaceData[];
  chipsBack: DnaChipFaceData[];
  flipIntervalMs?: number;
};

const textWrapStyle: CSSProperties = {
  wordBreak: "break-word",
  overflowWrap: "anywhere",
} as CSSProperties;

export function DnaPreviewFlipChips({
  chipsFront,
  chipsBack,
  flipIntervalMs = 5000,
}: DnaPreviewFlipChipsProps) {
  const [isBack, setIsBack] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const intervalId = window.setInterval(
      () => setIsBack((previous) => !previous),
      flipIntervalMs,
    );

    return () => window.clearInterval(intervalId);
  }, [flipIntervalMs]);

  const backByIndex = useMemo(() => {
    return chipsBack.reduce<Record<number, DnaChipFaceData>>((acc, chip, idx) => {
      acc[idx] = chip;
      return acc;
    }, {});
  }, [chipsBack]);

  function renderFaceContent(chip: DnaChipFaceData) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        <p
          className={cn(
            "self-center text-[0.7rem] font-bold uppercase leading-tight tracking-[0.14em] sm:text-[0.82rem]",
            chip.labelColor,
          )}
        >
          {chip.label}
        </p>
        {chip.content.kind === "colors" ? (
          <div className="flex flex-wrap justify-center gap-1.5">
            {chip.content.colors.map((color) => (
              <span
                key={color}
                className="size-[1.1rem] shrink-0 rounded-full ring-1 ring-white/10"
                style={{ backgroundColor: color }}
                aria-hidden
              />
            ))}
          </div>
        ) : chip.content.kind === "pills" ? (
          <div className="flex w-full max-w-full flex-wrap justify-center gap-1">
            {chip.content.items.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/15 bg-background/45 px-2 py-0.5 text-[0.7rem] font-medium leading-tight text-foreground/75 sm:text-[0.82rem]"
              >
                {item}
              </span>
            ))}
          </div>
        ) : chip.content.kind === "chat" ? (
          <div className="flex w-full min-w-0 flex-col items-stretch gap-1">
            {chip.content.prompts.map((prompt, promptIndex) => (
              <span
                key={`${prompt}-${promptIndex}`}
                className={cn(
                  "max-w-full rounded-md border px-2 py-1 text-left text-[0.7rem] font-medium leading-snug sm:text-[0.82rem]",
                  promptIndex % 2 === 0
                    ? "self-start border-white/15 bg-background/45 text-foreground/75"
                    : "self-end border-white/10 bg-white/10 text-foreground/70",
                )}
                style={textWrapStyle}
              >
                {prompt}
              </span>
            ))}
          </div>
        ) : (
          <p
            className={cn(
              chip.content.textClassName,
              "w-full max-w-full text-center leading-snug",
            )}
            style={textWrapStyle}
          >
            {chip.content.text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-14 flex flex-wrap items-start justify-center gap-4 sm:mt-16 sm:gap-5">
      {chipsFront.map((frontChip, index) => {
        const backChip = backByIndex[index];
        if (!backChip) return null;

        return (
          <div
            key={`${frontChip.label}-${index}`}
            className={cn(
              "animate-float w-fit max-w-[min(100%,20rem)] rounded-2xl border px-4 py-3 shadow-md backdrop-blur-sm sm:px-5 sm:py-4",
              frontChip.borderClass,
              frontChip.bgClass,
            )}
            style={{
              animationDelay: frontChip.delay,
              animationDuration: frontChip.duration,
              perspective: "900px",
            }}
          >
            {/* Both faces share one grid cell so row height = max(front, back) — no overflow from absolute back */}
            <div
              className="grid grid-cols-1 grid-rows-1 transition-transform duration-700 [transform-style:preserve-3d]"
              style={{
                transform: `rotate(${frontChip.rotate}) rotateY(${isBack ? 180 : 0}deg)`,
              }}
            >
              <div
                style={{ backfaceVisibility: "hidden" }}
                className="col-start-1 row-start-1 flex min-w-0 flex-col items-center gap-1.5 text-center"
              >
                {renderFaceContent(frontChip)}
              </div>
              <div
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
                className="col-start-1 row-start-1 flex min-w-0 flex-col items-center gap-1.5 text-center"
              >
                {renderFaceContent(backChip)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
