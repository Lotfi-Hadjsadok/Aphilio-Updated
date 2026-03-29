"use client";

import { ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SimilarDocument } from "@/types/ad-creatives";

export function ReferenceImagesGrid({ similarDocuments }: { similarDocuments: SimilarDocument[] }) {
  const tRef = useTranslations("adCreatives.referenceImages");
  const allImages = similarDocuments.flatMap((doc) => doc.imageUrls).slice(0, 6);

  if (allImages.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        <ImageIcon className="size-4 shrink-0 opacity-60" />
        <span>{tRef("noSimilarSections")}</span>
      </div>
    );
  }

  const docsWithImages = similarDocuments.filter((doc) => doc.imageUrls.length > 0);

  return (
    <div className="space-y-2">
      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
        {tRef("referenceImageCount", { count: allImages.length })}{" "}
        {tRef("referenceFromSections", { count: docsWithImages.length })}
      </p>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {allImages.map((url, imgIndex) => (
          <div
            key={imgIndex}
            className="aspect-square overflow-hidden rounded-lg border border-border/50 bg-muted/20"
          >
            <img
              src={url}
              alt={tRef("altReference", { position: imgIndex + 1 })}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
