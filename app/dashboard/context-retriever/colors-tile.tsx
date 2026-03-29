"use client";

import { useTranslations } from "next-intl";
import { Palette } from "lucide-react";
import type { BrandingDNA } from "@/types/scrape";
import { BentoTile } from "./bento-tile";
import { TileLabel } from "./tile-label";
import { HexSwatch } from "./hex-swatch";
import { resolveBrandColors } from "./lib/brand-color-utils";

export function ColorsTile({ branding }: { branding: BrandingDNA }) {
  const tCtx = useTranslations("dna.contextResult");
  const { primary, secondary } = resolveBrandColors(branding);

  return (
    <BentoTile label={tCtx("brandColors")} className="flex flex-col">
      <TileLabel icon={Palette}>{tCtx("palette")}</TileLabel>
      <div className="flex flex-1 gap-3 p-5 pt-4 sm:p-6 sm:pt-4">
        {primary ? (
          <HexSwatch label={tCtx("primary")} hex={primary} />
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 p-5">
            <span className="text-sm text-muted-foreground">
              {tCtx("noPrimaryColor")}
            </span>
          </div>
        )}
        {secondary ? (
          <HexSwatch label={tCtx("secondary")} hex={secondary} />
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 p-5">
            <span className="text-sm text-muted-foreground">
              {tCtx("noSecondaryColor")}
            </span>
          </div>
        )}
      </div>
    </BentoTile>
  );
}
