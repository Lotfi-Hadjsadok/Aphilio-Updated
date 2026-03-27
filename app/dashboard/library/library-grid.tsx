"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Download,
  Loader2,
  Maximize2,
  LayoutTemplate,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { deleteCreativeAction } from "@/app/actions/library";
import type { DeleteCreativeState, LibraryCreative } from "@/app/actions/library";

const initialDeleteState: DeleteCreativeState = { status: "idle" };

function CreativeCard({ creative }: { creative: LibraryCreative }) {
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteCreativeAction,
    initialDeleteState,
  );
  const [deleted, setDeleted] = useState(false);

  if (deleted || deleteState.status === "success") return null;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(creative.createdAt));

  return (
    <Card className="group overflow-hidden bg-card/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted/20">
        <Image
          src={creative.imageUrl}
          alt={creative.headline}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          unoptimized
        />

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <a
            href={creative.imageUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/35"
            aria-label="Download image"
          >
            <Download className="size-3.5" />
          </a>

          <form
            action={deleteFormAction}
            onSubmit={() => {
              setTimeout(() => setDeleted(true), 600);
            }}
          >
            <input type="hidden" name="creativeId" value={creative.id} />
            <button
              type="submit"
              disabled={deletePending}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/80 text-white backdrop-blur-sm transition-colors hover:bg-red-500 disabled:opacity-50"
              aria-label="Delete creative"
            >
              {deletePending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
            </button>
          </form>
        </div>
      </div>

      <CardContent className="space-y-2 px-3 pb-3 pt-2.5">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="secondary" className="text-[0.6rem]">
            {creative.templateLabel}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-[0.6rem]">
            <Maximize2 className="size-2.5" />
            {creative.aspectRatio}
          </Badge>
        </div>

        {/* Headline */}
        <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
          {creative.headline}
        </p>

        {/* Date */}
        <p className="flex items-center gap-1 text-[0.6rem] text-muted-foreground">
          <Calendar className="size-2.5 shrink-0" />
          {formattedDate}
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyLibrary() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/10 px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-gradient-subtle ring-1 ring-border">
        <LayoutTemplate className="size-6 text-foreground" strokeWidth={1.5} />
      </div>
      <div className="max-w-xs space-y-1.5">
        <p className="font-heading text-base font-semibold text-foreground">No creatives yet</p>
        <p className="text-sm text-muted-foreground">
          Generate ad images from the Ad Creatives tool — they'll appear here automatically.
        </p>
      </div>
    </div>
  );
}

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
