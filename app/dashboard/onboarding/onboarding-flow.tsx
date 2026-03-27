"use client";

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  saveOnboardingPreferences,
  completeOnboarding,
  findExistingContextByUrl,
  type OnboardingState,
} from "@/app/actions/onboarding";
import { scrapeWebsite } from "@/app/actions/scrape";
import type { ScrapeState } from "@/types/scrape";
import { WelcomeStep } from "./steps/welcome-step";
import { UrlStep } from "./steps/url-step";
import { LanguageStep } from "./steps/language-step";
import { ScrapeStep } from "./steps/scrape-step";

const TOTAL_STEPS = 4;

const initialOnboardingState: OnboardingState = {};
const initialScrapeState: ScrapeState = {};

export function OnboardingFlow({ userName }: { userName: string }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [welcomeDone, setWelcomeDone] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrapeTriggered = useRef(false);

  const [, langAction, langPending] = useActionState(
    saveOnboardingPreferences,
    initialOnboardingState,
  );
  const [scrapeState, scrapeAction, scrapePending] = useActionState(
    scrapeWebsite,
    initialScrapeState,
  );

  useEffect(() => {
    const timer = setTimeout(() => setWelcomeDone(true), 3200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (welcomeDone && currentStep === 0) {
      transitionTo(1);
    }
  }, [welcomeDone, currentStep]);

  const transitionTo = useCallback((nextStep: number) => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setFadeIn(true);
    }, 300);
  }, []);

  const handleUrlSubmit = useCallback(
    (url: string) => {
      setWebsiteUrl(url);
      transitionTo(2);
    },
    [transitionTo],
  );

  const handleLanguageConfirm = useCallback(
    (language: string) => {
      setSelectedLanguage(language);
      const formData = new FormData();
      formData.append("language", language);
      startTransition(() => {
        langAction(formData);
      });
      transitionTo(3);
    },
    [langAction, transitionTo],
  );

  useEffect(() => {
    if (currentStep === 3 && websiteUrl && !scrapeTriggered.current) {
      scrapeTriggered.current = true;
      const formData = new FormData();
      formData.append("url", websiteUrl);
      startTransition(() => {
        scrapeAction(formData);
      });
    }
  }, [currentStep, websiteUrl, scrapeAction]);

  const scrapeResultId = scrapeState.result?.id;
  const scrapeError = scrapeState.error;

  useEffect(() => {
    if (scrapeResultId) {
      completeOnboarding().then(() => {
        router.push(`/dashboard/dna/${scrapeResultId}`);
      });
      return;
    }

    if (scrapeError && websiteUrl) {
      findExistingContextByUrl(websiteUrl).then((existingId) => {
        if (existingId) {
          completeOnboarding().then(() => {
            router.push(`/dashboard/dna/${existingId}`);
          });
        }
      });
    }
  }, [scrapeResultId, scrapeError, websiteUrl, router]);

  return (
    <div ref={containerRef} className="relative z-10 flex w-full flex-col items-center justify-center px-4">
      {/* Progress dots */}
      {currentStep > 0 && (
        <div className="absolute top-6 flex items-center gap-2 sm:top-8">
          {Array.from({ length: TOTAL_STEPS - 1 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                index < currentStep
                  ? "w-8 bg-foreground"
                  : index === currentStep
                    ? "w-8 bg-foreground/40"
                    : "w-1.5 bg-foreground/15",
              )}
            />
          ))}
        </div>
      )}

      <div
        className={cn(
          "w-full transition-all duration-300",
          fadeIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        {currentStep === 0 && <WelcomeStep userName={userName} />}
        {currentStep === 1 && <UrlStep onSubmit={handleUrlSubmit} />}
        {currentStep === 2 && (
          <LanguageStep
            selectedLanguage={selectedLanguage}
            onSelect={handleLanguageConfirm}
            pending={langPending}
          />
        )}
        {currentStep === 3 && (
          <ScrapeStep
            url={websiteUrl}
            pending={scrapePending}
            error={scrapeState.error}
            result={scrapeState.result}
          />
        )}
      </div>
    </div>
  );
}
