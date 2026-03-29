"use client";

import { useTranslations } from "next-intl";
import { Type } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TypographyEntry } from "@/types/scrape";
import { BentoTile } from "./bento-tile";
import { TileLabel } from "./tile-label";

export function TypographyTile({
  typography,
}: {
  typography: TypographyEntry[] | null;
}) {
  const tCtx = useTranslations("dna.contextResult");
  const entries = Array.isArray(typography) ? typography : [];
  const entryCount = entries.length;

  const typographyGridClass = cn(
    "grid gap-3",
    entryCount === 1 && "grid-cols-1",
    entryCount === 2 && "grid-cols-1 sm:grid-cols-2",
    entryCount === 3 && "grid-cols-1 sm:grid-cols-3",
    entryCount >= 4 && "grid-cols-2 sm:grid-cols-4",
  );

  return (
    <BentoTile
      label={tCtx("typography")}
      className="flex flex-col sm:col-span-2"
    >
      <TileLabel icon={Type}>{tCtx("typography")}</TileLabel>
      <div className="flex flex-1 flex-col p-5 pt-4 sm:p-6 sm:pt-4">
        {entries.length > 0 ? (
          <div className={typographyGridClass}>
            {entries.map((entry) => (
              <div
                key={entry.fontfamily}
                className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/70 px-4 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-base font-semibold text-foreground">
                    {entry.fontfamily}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tCtx("bodyHeading", { body: entry.body, heading: entry.heading })}
                  </p>
                </div>
                <span className="shrink-0 text-3xl font-light text-muted-foreground/30">
                  Aa
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 px-5 py-8">
            <p className="text-center text-sm text-muted-foreground">
              {tCtx("noTypography")}
            </p>
          </div>
        )}
      </div>
    </BentoTile>
  );
}
