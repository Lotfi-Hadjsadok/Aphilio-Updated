"use client";

import { useTranslations } from "next-intl";
import { Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { GeneratedAdPrompt } from "@/types/ad-creatives";

export function CreativeSummaryBlock({ prompt }: { prompt: GeneratedAdPrompt }) {
  const tLayouts = useTranslations("adCreatives.layouts");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline" className="flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-medium">
        <Maximize2 className="size-3 shrink-0" aria-hidden />
        <span className="tabular-nums">{prompt.aspectRatio}</span>
      </Badge>
      <Badge variant="secondary" className="rounded-lg px-2.5 py-0.5 text-xs font-medium">
        {tLayouts(prompt.templateId)}
      </Badge>
    </div>
  );
}
