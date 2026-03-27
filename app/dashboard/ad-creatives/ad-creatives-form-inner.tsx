"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadDnaForAdCreativesAction } from "@/app/actions/ad-creatives";
import type { SavedContextSummary } from "@/types/scrape";
import type { LoadAdCreativesDnaState } from "@/types/ad-creatives";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NoDnaState } from "./no-dna-state";
import { DnaSelectionStep } from "./dna-selection-step";
import { AdCreativesGenerateBlock } from "./ad-creatives-generate-block";

const initialLoadState: LoadAdCreativesDnaState = { status: "idle" };

export function AdCreativesFormInner({
  savedContexts,
  onChangeDnaRequest,
}: {
  savedContexts: SavedContextSummary[];
  onChangeDnaRequest: () => void;
}) {
  const [loadState, loadFormAction, loadPending] = useActionState(
    loadDnaForAdCreativesAction,
    initialLoadState,
  );
  const [pickedContextId, setPickedContextId] = useState<string | null>(null);

  const hasLibrary = savedContexts.length > 0;
  const loadError = loadState.status === "error" ? loadState.message : null;
  const readyPayload = loadState.status === "ready" ? loadState.payload : null;

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-card/40 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Dashboard"
            className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }), "shrink-0 rounded-lg")}
          >
            <ArrowLeft className="size-3.5" />
          </Link>
          <div className="min-w-0">
            <p className="font-heading text-sm font-semibold tracking-tight text-foreground">
              Ad creatives
            </p>
            <p className="text-[0.65rem] text-muted-foreground">
              DNA → angle → configure → generate
            </p>
          </div>
        </div>
        {readyPayload ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={onChangeDnaRequest}
          >
            Change DNA
          </Button>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-hidden flex flex-col">
        {!hasLibrary ? (
          <NoDnaState />
        ) : readyPayload ? (
          <AdCreativesGenerateBlock
            key={readyPayload.contextId}
            payload={readyPayload}
            onChangeDna={onChangeDnaRequest}
          />
        ) : (
          <DnaSelectionStep
            savedContexts={savedContexts}
            loadError={loadError}
            loadPending={loadPending}
            pickedContextId={pickedContextId}
            setPickedContextId={setPickedContextId}
            loadFormAction={loadFormAction}
          />
        )}
      </div>
    </div>
  );
}
