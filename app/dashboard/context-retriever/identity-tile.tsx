"use client";

import { useTranslations } from "next-intl";
import { Images } from "lucide-react";
import type { BrandingDNA } from "@/types/scrape";
import { BentoTile } from "./bento-tile";
import { TileLabel } from "./tile-label";

export function IdentityTile({ branding }: { branding: BrandingDNA }) {
  const tCtx = useTranslations("dna.contextResult");
  const hasAssets = branding.logo || branding.favicon;

  return (
    <BentoTile label={tCtx("brandIdentity")} className="flex flex-col">
      <TileLabel icon={Images}>{tCtx("identity")}</TileLabel>
      <div className="flex flex-1 items-center gap-5 p-5 pt-4 sm:p-6 sm:pt-4">
        {hasAssets ? (
          <>
            {branding.logo && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                  {tCtx("logo")}
                </span>
                <div className="flex h-20 w-32 items-center justify-center rounded-xl border border-border/60 bg-[oklch(0.94_0_0)] p-3 shadow-sm dark:bg-[oklch(0.25_0_0)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={branding.logo}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
            {branding.favicon && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                  {tCtx("favicon")}
                </span>
                <div className="flex size-20 items-center justify-center rounded-xl border border-border/60 bg-background shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={branding.favicon}
                    alt=""
                    className="max-h-10 max-w-10 object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-5 py-8">
            <p className="text-center text-sm text-muted-foreground">
              {tCtx("noIdentityAssets")}
            </p>
          </div>
        )}
      </div>
    </BentoTile>
  );
}
