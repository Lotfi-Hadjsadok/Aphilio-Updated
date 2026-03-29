"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { LibraryCreative } from "@/app/actions/library";
import { CreativeCard } from "./creative-card";
import { EmptyLibrary } from "./empty-library";

export function LibraryGrid({ initialCreatives, initialTotal }: {
  initialCreatives: LibraryCreative[];
  initialTotal: number;
}) {
  const [creatives] = useState<LibraryCreative[]>(initialCreatives);

  if (creatives.length === 0) {
    return <EmptyLibrary />;
  }

  return (
    <div className="space-y-4">
      <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {initialTotal} {initialTotal === 1 ? "creative" : "creatives"}
      </p>
      <div
        className={cn(
          "grid gap-4",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        )}
      >
        {creatives.map((creative) => (
          <CreativeCard key={creative.id} creative={creative} />
        ))}
      </div>
    </div>
  );
}
