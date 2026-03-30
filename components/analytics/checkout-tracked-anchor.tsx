"use client";

import type { ComponentProps } from "react";
import { APHILIO_GA_EVENTS } from "@/lib/analytics/events";
import { trackGaEvent } from "@/lib/analytics/track-client";

type CheckoutTrackedAnchorProps = Omit<ComponentProps<"a">, "onClick"> & {
  planSlug: string;
};

export function CheckoutTrackedAnchor({ planSlug, href, ...rest }: CheckoutTrackedAnchorProps) {
  return (
    <a
      {...rest}
      href={href}
      onClick={() => {
        trackGaEvent(APHILIO_GA_EVENTS.checkoutClick, { plan_slug: planSlug });
      }}
    />
  );
}
