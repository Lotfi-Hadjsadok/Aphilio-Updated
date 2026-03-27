"use client";

import { useState } from "react";
import type { SavedContextSummary } from "@/types/scrape";
import { AdCreativesFormInner } from "./ad-creatives-form-inner";

export function AdCreativesForm({ savedContexts }: { savedContexts: SavedContextSummary[] }) {
  const [sessionKey, setSessionKey] = useState(0);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdCreativesFormInner
        key={sessionKey}
        savedContexts={savedContexts}
        onChangeDnaRequest={() => setSessionKey((prev) => prev + 1)}
      />
    </div>
  );
}
