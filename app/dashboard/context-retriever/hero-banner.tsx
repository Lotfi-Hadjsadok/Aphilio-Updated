"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink, Fingerprint } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ScrapeResult } from "@/types/scrape";
import { BentoTile } from "./bento-tile";

export function HeroBanner({
  result,
  primary,
}: {
  result: ScrapeResult;
  primary: string | null;
}) {
  const tCtx = useTranslations("dna.contextResult");
  const [ogFailed, setOgFailed] = useState(false);
  const hasOg = result.branding?.ogImage && !ogFailed;

  return (
    <BentoTile
      className="col-span-full min-h-[200px] sm:min-h-[260px]"
      label={tCtx("brandOverview")}
    >
      {hasOg && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.branding!.ogImage!}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setOgFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-card/40" />
        </div>
      )}

      <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
        <div className="flex flex-wrap items-end gap-5">
          {result.branding?.logo && (
            <div
              className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-background/85 p-2.5 shadow-md backdrop-blur-sm sm:size-20"
              style={
                primary
                  ? { borderColor: `${primary}60` }
                  : undefined
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.branding.logo}
                alt=""
                className="max-h-full max-w-full object-contain"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {result.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <a
                href={result.scrapedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
              >
                {result.baseUrl}
                <ExternalLink className="size-3 opacity-60" />
              </a>
              {result.personality?.archetype && (
                <>
                  <Separator
                    orientation="vertical"
                    className="h-3.5 bg-border/60"
                  />
                  <Badge
                    variant="secondary"
                    className="max-w-[min(100%,14rem)] min-w-0 gap-1.5 border border-border/50 bg-muted/50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider"
                    title={result.personality.archetype}
                  >
                    <Fingerprint className="size-3 shrink-0" />
                    <span className="min-w-0 truncate">{result.personality.archetype}</span>
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </BentoTile>
  );
}
