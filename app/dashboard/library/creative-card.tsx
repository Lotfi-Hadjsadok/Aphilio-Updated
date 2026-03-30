"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Calendar, Download, Loader2, Maximize2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { deleteCreativeAction } from "@/app/actions/library";
import { APHILIO_GA_EVENTS } from "@/lib/analytics/events";
import { trackGaEvent } from "@/lib/analytics/track-client";
import type { DeleteCreativeState, LibraryCreative } from "@/app/actions/library";

const initialDeleteState: DeleteCreativeState = { status: "idle" };

export function CreativeCard({ creative }: { creative: LibraryCreative }) {
  const tLibrary = useTranslations("library");
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
      <div className="relative aspect-square w-full overflow-hidden bg-muted/20">
        <Image
          src={creative.imageUrl}
          alt={creative.headline}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          unoptimized
        />

        <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <a
            href={creative.imageUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/35"
            aria-label={tLibrary("downloadImageAria")}
            onClick={() => {
              trackGaEvent(APHILIO_GA_EVENTS.libraryCreativeDownloadClick, {
                template_label: creative.templateLabel,
              });
            }}
          >
            <Download className="size-3.5" />
          </a>

          <form
            action={deleteFormAction}
            onSubmit={() => {
              trackGaEvent(APHILIO_GA_EVENTS.libraryCreativeDeleted, {
                template_label: creative.templateLabel,
              });
              setTimeout(() => setDeleted(true), 600);
            }}
          >
            <input type="hidden" name="creativeId" value={creative.id} />
            <button
              type="submit"
              disabled={deletePending}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/80 text-white backdrop-blur-sm transition-colors hover:bg-red-500 disabled:opacity-50"
              aria-label={tLibrary("deleteCreativeAria")}
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
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="secondary" className="text-[0.6rem]">
            {creative.templateLabel}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-[0.6rem]">
            <Maximize2 className="size-2.5" />
            {creative.aspectRatio}
          </Badge>
        </div>

        <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
          {creative.headline}
        </p>

        <p className="flex items-center gap-1 text-[0.6rem] text-muted-foreground">
          <Calendar className="size-2.5 shrink-0" />
          {formattedDate}
        </p>
      </CardContent>
    </Card>
  );
}
