"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Dna, AlertCircle, CheckCircle2 } from "lucide-react";
import type { ScrapeResult } from "@/types/scrape";

const LOADING_MESSAGES = [
  "Opening your website in a browser session…",
  "Scanning page structure and layout…",
  "Extracting colors, fonts, and logos…",
  "Reading content and copy…",
  "Analyzing brand voice and personality…",
  "Generating marketing angles…",
  "Building your brand DNA profile…",
  "Almost there, finalizing your DNA…",
];

export function ScrapeStep({
  url,
  pending,
  error,
  result,
}: {
  url: string;
  pending: boolean;
  error?: string;
  result?: ScrapeResult;
}) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    if (!pending) return;

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 4500);

    return () => clearInterval(messageInterval);
  }, [pending]);

  useEffect(() => {
    if (!pending) {
      if (result) setProgressWidth(100);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgressWidth((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 3 + 0.5;
      });
    }, 800);

    return () => clearInterval(progressInterval);
  }, [pending, result]);

  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center">
      <div className="flex w-full max-w-lg flex-col items-center gap-8 text-center">
        {/* DNA icon with animation */}
        <div className="relative">
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-3xl shadow-2xl sm:h-24 sm:w-24",
              error
                ? "bg-destructive/10 ring-1 ring-destructive/30"
                : result
                  ? "bg-emerald-500/10 ring-1 ring-emerald-500/30"
                  : "bg-accent-gradient",
            )}
          >
            {error ? (
              <AlertCircle className="h-10 w-10 text-destructive sm:h-12 sm:w-12" strokeWidth={1.5} />
            ) : result ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-500 sm:h-12 sm:w-12" strokeWidth={1.5} />
            ) : (
              <Dna className="h-10 w-10 text-white sm:h-12 sm:w-12 animate-spin-slow" strokeWidth={1.5} />
            )}
          </div>
          {pending && (
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent-gradient opacity-15 blur-2xl animate-pulse-glow" />
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {error
              ? "Something went wrong"
              : result
                ? "DNA extracted!"
                : "Extracting your DNA"}
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            {error
              ? error
              : result
                ? `We've captured the brand profile for ${hostname}. Redirecting you now…`
                : hostname}
          </p>
        </div>

        {/* Progress bar */}
        {!error && (
          <div className="w-full max-w-sm space-y-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent-gradient transition-all duration-700 ease-out"
                style={{ width: `${Math.min(progressWidth, 100)}%` }}
              />
            </div>

            {/* Status message */}
            <p
              key={messageIndex}
              className="animate-in fade-in slide-in-from-bottom-2 text-sm text-muted-foreground duration-500"
            >
              {pending ? LOADING_MESSAGES[messageIndex] : result ? "Complete!" : "Starting…"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
