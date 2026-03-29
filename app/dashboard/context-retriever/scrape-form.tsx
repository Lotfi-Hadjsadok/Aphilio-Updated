"use client";

import type { SavedContextSummary } from "@/types/scrape";
import { ScrapeFormInner } from "./scrape-form-inner";

export function ScrapeForm({ savedContexts }: { savedContexts: SavedContextSummary[] }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrapeFormInner savedContexts={savedContexts} />
    </div>
  );
}
