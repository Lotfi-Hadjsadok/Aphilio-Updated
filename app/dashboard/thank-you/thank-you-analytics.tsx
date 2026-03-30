"use client";

import { useEffect, useRef } from "react";
import { APHILIO_GA_EVENTS } from "@/lib/analytics/events";
import { trackGaEvent } from "@/lib/analytics/track-client";

export function ThankYouAnalytics() {
  const trackedRef = useRef(false);
  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackGaEvent(APHILIO_GA_EVENTS.purchaseThankYouView, {});
  }, []);
  return null;
}
