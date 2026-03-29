"use client";

import { Globe } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function faviconFallbackUrl(hostname: string): string {
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(hostname)}.ico`;
}

/** Site favicon when stored, otherwise a hostname-based icon service, then a globe. */
export function BrandMarkAvatar({
  faviconUrl,
  hostname,
  className,
}: {
  faviconUrl: string | null;
  hostname: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const imageSource = faviconUrl ?? faviconFallbackUrl(hostname);

  return (
    <span className={cn("relative flex size-full min-h-0 min-w-0 items-center justify-center", className)}>
      {!broken ? (
        <img
          src={imageSource}
          alt=""
          width={40}
          height={40}
          className="h-full w-full max-h-full max-w-full object-contain object-center"
          onError={() => setBroken(true)}
        />
      ) : (
        <Globe className="size-8 shrink-0" strokeWidth={1.75} />
      )}
    </span>
  );
}
