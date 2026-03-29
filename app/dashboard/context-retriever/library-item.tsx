"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, Clock, Globe, Layers } from "lucide-react";
import { FormattedDate, FORMAT_DATE_SHORT } from "@/components/formatted-date";
import type { SavedContextSummary } from "@/types/scrape";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

export function LibraryItem({
  savedContext,
  deleteFormAction,
  deletePending,
  onNavigate,
}: {
  savedContext: SavedContextSummary;
  deleteFormAction: (formData: FormData) => void | Promise<void>;
  deletePending: boolean;
  onNavigate: () => void;
}) {
  const tDna = useTranslations("dna");
  return (
    <div className="group/item flex w-full items-center gap-1.5 rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 transition-colors hover:bg-background/90">
      <Link
        href={`/dashboard/dna/${savedContext.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
        onClick={onNavigate}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border/60">
          <Globe className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {savedContext.name}
          </span>
          <span className="mt-0.5 flex items-center gap-2 text-[0.65rem] text-muted-foreground">
            <span className="flex items-center gap-1 tabular-nums">
              <Clock className="size-2.5 opacity-70" />
              <FormattedDate date={savedContext.createdAt} options={FORMAT_DATE_SHORT} />
            </span>
            {savedContext.subcontextCount > 1 && (
              <span className="flex items-center gap-1">
                <Layers className="size-2.5" />
                {tDna("pathsCount", { count: savedContext.subcontextCount })}
              </span>
            )}
          </span>
        </span>
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover/item:text-muted-foreground" />
      </Link>
      <DeleteConfirmDialog
        savedContext={savedContext}
        deleteFormAction={deleteFormAction}
        deletePending={deletePending}
      />
    </div>
  );
}
