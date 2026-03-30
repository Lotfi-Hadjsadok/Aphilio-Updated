"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { trackGaPageView } from "@/lib/analytics/track-client";

function GoogleAnalyticsPageViewsInner() {
  const pathname = usePathname();
  const searchParameters = useSearchParams();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    const search = searchParameters.toString();
    const pathWithQuery = search ? `${pathname}?${search}` : pathname;
    if (previousPathRef.current === pathWithQuery) return;
    previousPathRef.current = pathWithQuery;
    trackGaPageView(pathWithQuery);
  }, [pathname, searchParameters]);

  return null;
}

/**
 * Wrap in Suspense because useSearchParams() needs a boundary in static routes.
 */
export function GoogleAnalyticsPageViews() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsPageViewsInner />
    </Suspense>
  );
}

type GoogleAnalyticsScriptsProps = {
  measurementId: string;
};

export function GoogleAnalyticsScripts({ measurementId: gaMeasurementId }: GoogleAnalyticsScriptsProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="aphilio-gtag-init" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}', { send_page_view: true });
`}
      </Script>
    </>
  );
}
