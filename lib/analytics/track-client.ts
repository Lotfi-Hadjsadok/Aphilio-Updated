"use client";

import type { AphilioGaEventParams } from "@/lib/analytics/events";

declare global {
  interface Window {
    gtag?: (...arguments_: unknown[]) => void;
  }
}

function measurementId(): string | undefined {
  return process.env.NEXT_PUBLIC_GTM_ID;
}

export function isGoogleAnalyticsConfigured(): boolean {
  return Boolean(measurementId());
}

/**
 * Sends a GA4 event via gtag (client-only). Params are limited to primitives GA accepts.
 */
export function trackGaEvent(eventName: string, eventParams?: AphilioGaEventParams): void {
  const gaId = measurementId();
  if (!gaId || typeof window === "undefined") return;
  const gtagFn = window.gtag;
  if (typeof gtagFn !== "function") return;
  gtagFn("event", eventName, eventParams ?? {});
}

/**
 * SPA / client navigation page views (initial load is handled by gtag config).
 */
export function trackGaPageView(pagePath: string, pageTitle?: string): void {
  const gaId = measurementId();
  if (!gaId || typeof window === "undefined") return;
  const gtagFn = window.gtag;
  if (typeof gtagFn !== "function") return;
  gtagFn("config", gaId, {
    page_path: pagePath,
    ...(pageTitle ? { page_title: pageTitle } : {}),
  });
}
