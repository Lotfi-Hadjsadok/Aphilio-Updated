"use client";

import { use } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ContextImagesGridProps = {
  promise: Promise<string[]>;
  selectedUrls: string[];
  onToggle: (url: string) => void;
};

function orderedUniqueUrls(urls: string[]): string[] {
  const trimmed = urls.map((url) => url.trim()).filter(Boolean);
  const unique = [...new Set(trimmed)];
  unique.sort((first, second) => first.localeCompare(second, undefined, { sensitivity: "base" }));
  return unique;
}

export function ContextImagesGrid({ promise, selectedUrls, onToggle }: ContextImagesGridProps) {
  const rawImages = use(promise);
  const images = orderedUniqueUrls(rawImages);

  if (images.length === 0) {
    return (
      <p className="px-1 text-sm text-muted-foreground">No images found in this context.</p>
    );
  }

  return (
    <div
      className="grid w-full grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-2 sm:min-w-0 sm:grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] sm:gap-2.5"
      aria-label="Reference images from this context, sorted A to Z by URL"
    >
      {images.map((url, index) => {
        const selected = selectedUrls.includes(url);
        return (
          <button
            key={url}
            type="button"
            onClick={() => onToggle(url)}
            className={cn(
              "relative aspect-square w-full min-w-0 overflow-hidden rounded-xl border-2 transition-all",
              selected
                ? "border-foreground/80 ring-2 ring-ring/40"
                : "border-border hover:border-muted-foreground/50",
            )}
            aria-pressed={selected}
            aria-label={`Reference ${index + 1} of ${images.length}${selected ? ", selected" : ""}`}
          >
            <Image unoptimized src={url} alt="" fill className="object-cover" sizes="56px" />
            {selected && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 backdrop-blur-[1px]">
                <Check className="size-4 text-background" strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
