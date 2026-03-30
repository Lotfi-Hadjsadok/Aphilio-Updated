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
import { setLocaleCookieAction } from "@/app/actions/locale";
import {
  saveOnboardingPreferences,
  saveOnboardingProgress,
  completeOnboarding,
  findExistingContextByUrl,
  type OnboardingState,
} from "@/app/actions/onboarding";
import { scrapeWebsite } from "@/app/actions/scrape";
import type { ScrapeState } from "@/types/scrape";
import { APHILIO_GA_EVENTS } from "@/lib/analytics/events";
import { trackGaEvent } from "@/lib/analytics/track-client";
import { WelcomeStep } from "./steps/welcome-step";
import { UrlStep } from "./steps/url-step";
import { LanguageStep } from "./steps/language-step";
import { ScrapeStep } from "./steps/scrape-step";

const TOTAL_STEPS = 4;

const initialOnboardingState: OnboardingState = {};
const initialScrapeState: ScrapeState = {};

function resolveInitialOnboardingStep(
  savedStep: number,
  draftUrl: string,
): number {
  if (savedStep >= 2 && !draftUrl.trim()) {
    return 1;
  }
  return savedStep;
}

export type OnboardingFlowProps = {
  userName: string;
  initialOnboardingStep: number;
  initialDraftUrl: string;
  initialPreferredLanguage: string;
};

export function OnboardingFlow({
  userName,
  initialOnboardingStep,
  initialDraftUrl,
  initialPreferredLanguage,
}: OnboardingFlowProps) {
  const router = useRouter();
  const resolvedInitialStep = resolveInitialOnboardingStep(
    initialOnboardingStep,
    initialDraftUrl,
  );
  const [currentStep, setCurrentStep] = useState(resolvedInitialStep);
  const [websiteUrl, setWebsiteUrl] = useState(() =>
    initialDraftUrl.trim() ? initialDraftUrl : "",
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => initialPreferredLanguage.trim() || "en",
  );
  const [welcomeDone, setWelcomeDone] = useState(resolvedInitialStep > 0);
  const [fadeIn, setFadeIn] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrapeTriggered = useRef(false);
  const scrapePendingPreviousRef = useRef(false);

  const [, langAction, langPending] = useActionState(
    saveOnboardingPreferences,
    initialOnboardingState,
  );
  const [scrapeState, scrapeAction, scrapePending] = useActionState(
    scrapeWebsite,
    initialScrapeState,
  );

  const transitionTo = useCallback((nextStep: number) => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setFadeIn(true);
    }, 300);
  }, []);

  useEffect(() => {
    if (resolvedInitialStep > 0) return;
    const timer = setTimeout(() => setWelcomeDone(true), 3200);
    return () => clearTimeout(timer);
  }, [resolvedInitialStep]);

  useEffect(() => {
    if (welcomeDone && currentStep === 0) {
      void saveOnboardingProgress(1, null);
      transitionTo(1);
    }
  }, [welcomeDone, currentStep, transitionTo]);

  const handleUrlSubmit = useCallback(
    (url: string) => {
      const trimmed = url.trim();
      void saveOnboardingProgress(2, trimmed || null);
      setWebsiteUrl(url);
      transitionTo(2);
    },
    [transitionTo],
  );

  const handleLanguageSelect = useCallback(
    async (language: string) => {
      setSelectedLanguage(language);
      await setLocaleCookieAction(language);
      router.refresh();
    },
    [router],
  );

  const handleLanguageContinue = useCallback(() => {
    const formData = new FormData();
    formData.append("language", selectedLanguage);
    startTransition(() => {
      langAction(formData);
    });
    void saveOnboardingProgress(
      3,
      websiteUrl.trim() ? websiteUrl.trim() : null,
    );
    transitionTo(3);
  }, [langAction, selectedLanguage, transitionTo, websiteUrl]);

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
    trackGaEvent(APHILIO_GA_EVENTS.onboardingStepView, { step: currentStep });
  }, [currentStep]);

  useEffect(() => {
    if (scrapePending && !scrapePendingPreviousRef.current) {
      trackGaEvent(APHILIO_GA_EVENTS.brandDnaScrapeStart, { surface: "onboarding" });
    }
    if (!scrapePending && scrapePendingPreviousRef.current) {
      if (scrapeResultId) {
        trackGaEvent(APHILIO_GA_EVENTS.onboardingScrapeComplete, {});
      } else if (scrapeError) {
        trackGaEvent(APHILIO_GA_EVENTS.onboardingScrapeError, {});
      }
    }
    scrapePendingPreviousRef.current = scrapePending;
  }, [scrapePending, scrapeResultId, scrapeError]);

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
        <div className="absolute left-1/2 top-6 flex -translate-x-1/2 items-center gap-2 sm:top-8">
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
          currentStep > 0 && "pt-14 sm:pt-16",
          fadeIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        {currentStep === 0 && <WelcomeStep userName={userName} />}
        {currentStep === 1 && <UrlStep onSubmit={handleUrlSubmit} />}
        {currentStep === 2 && (
          <LanguageStep
            selectedLanguage={selectedLanguage}
            onSelectLanguage={handleLanguageSelect}
            onContinue={handleLanguageContinue}
            continuePending={langPending}
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
