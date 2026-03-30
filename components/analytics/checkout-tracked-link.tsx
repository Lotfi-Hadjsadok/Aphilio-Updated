"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { APHILIO_GA_EVENTS } from "@/lib/analytics/events";
import { trackGaEvent } from "@/lib/analytics/track-client";

type CheckoutTrackedLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  planSlug: string;
};

/**
 * Tracks Polar checkout intent before navigation (monthly / yearly, etc.).
 */
export function CheckoutTrackedLink({ planSlug, href, ...rest }: CheckoutTrackedLinkProps) {
  return (
    <Link
      {...rest}
      href={href}
      onClick={() => {
        trackGaEvent(APHILIO_GA_EVENTS.checkoutClick, { plan_slug: planSlug });
      }}
    />
  );
}
