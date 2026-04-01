"use client";

import { useId, type ReactNode } from "react";

type HeroConvertHighlightProps = {
  children: ReactNode;
};

export function HeroConvertHighlight({ children }: HeroConvertHighlightProps) {
  const gradientId = `hero-convert-underline-${useId().replace(/:/g, "")}`;

  return (
    <span className="relative inline-block pb-[0.22em] align-baseline sm:pb-[0.26em]">
      <span className="text-gradient font-bold leading-tight tracking-tight text-[1.12em] sm:text-[1.3em] lg:text-[1.26em]">
        {children}
      </span>
      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-[0.38em] w-full min-w-[2.75rem] overflow-visible sm:h-[0.44em] lg:h-[0.48em]"
        viewBox="0 0 100 18"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="28%" stopColor="#ef4444" />
            <stop offset="52%" stopColor="#a855f7" />
            <stop offset="76%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <path
          className="hero-pencil-underline-path"
          d="M 0.8 11 C 11 4.5 26 13.5 38 8.5 C 48 5 58 11 68 8 C 76 5.5 84 10.5 92 8.5 C 95.5 7.5 98 9.2 99.5 10"
          fill="none"
          pathLength="100"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.2"
          vectorEffect="nonScalingStroke"
        />
      </svg>
    </span>
  );
}
