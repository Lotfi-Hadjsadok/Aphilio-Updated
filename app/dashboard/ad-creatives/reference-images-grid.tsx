import { ImageIcon } from "lucide-react";
import type { SimilarDocument } from "@/types/ad-creatives";

export function ReferenceImagesGrid({ similarDocuments }: { similarDocuments: SimilarDocument[] }) {
  const allImages = similarDocuments.flatMap((doc) => doc.imageUrls).slice(0, 6);

  if (allImages.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        <ImageIcon className="size-4 shrink-0 opacity-60" />
        <span>No images found in similar sections — the AI will use your brand logo only.</span>
      </div>
    );
  }

  const docsWithImages = similarDocuments.filter((doc) => doc.imageUrls.length > 0);

  return (
    <div className="space-y-2">
      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
        {allImages.length} reference image{allImages.length !== 1 ? "s" : ""} from {docsWithImages.length} similar section{docsWithImages.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {allImages.map((url, imgIndex) => (
          <div
            key={imgIndex}
            className="aspect-square overflow-hidden rounded-lg border border-border/50 bg-muted/20"
          >
            <img
              src={url}
              alt={`Reference ${imgIndex + 1}`}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
