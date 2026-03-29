"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function WelcomeStep({ userName }: { userName: string }) {
  const t = useTranslations("onboarding.welcome");
  const greeting = t("greeting");

  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [showName, setShowName] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex <= greeting.length) {
        setDisplayedText(greeting.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowName(true), 200);
        setTimeout(() => setShowSubtitle(true), 600);
        setTimeout(() => setShowCursor(false), 1200);
      }
    }, 65);

    return () => clearInterval(interval);
  }, [greeting]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Animated logo */}
        <div className="relative mb-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-gradient shadow-2xl sm:h-24 sm:w-24">
            <img
              src="/aphilio-logo.webp"
              alt="Aphilio"
              className="h-14 w-14 rounded-2xl sm:h-16 sm:w-16"
            />
          </div>
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-accent-gradient opacity-20 blur-2xl" />
        </div>

        {/* Typewriter heading */}
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {displayedText}
          {showCursor && (
            <span className="ml-0.5 inline-block h-[1em] w-[3px] translate-y-[0.05em] animate-pulse bg-foreground" />
          )}
        </h1>

        {/* User name fade-in */}
        <p
          className={cn(
            "text-xl font-medium text-gradient sm:text-2xl lg:text-3xl transition-all duration-700",
            showName ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
        >
          {userName}
        </p>

        {/* Subtitle */}
        <p
          className={cn(
            "max-w-md text-sm text-muted-foreground sm:text-base transition-all duration-700 delay-150",
            showSubtitle ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
        >
          {t("subtitle")}
        </p>

        {/* Loading dots */}
        <div className="mt-4 flex items-center gap-1.5">
          {[0, 1, 2].map((dotIndex) => (
            <div
              key={dotIndex}
              className="h-2 w-2 rounded-full bg-foreground/30"
              style={{
                animation: "bounce-slow 1.2s infinite",
                animationDelay: `${dotIndex * 200}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
