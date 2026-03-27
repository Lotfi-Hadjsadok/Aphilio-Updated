"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ReferenceThumbsRow({ urls }: { urls: string[] }) {
  const [open, setOpen] = useState(false);

  if (urls.length === 0) return null;

  return (
    <div className="mt-3 pl-14">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-600 transition-colors hover:text-zinc-900"
      >
        {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        {urls.length} reference{urls.length !== 1 ? "s" : ""}
      </button>
      {open && (
        <div className="mt-2 flex flex-wrap gap-2">
          {urls.map((url, index) => (
            <div
              key={index}
              className="relative h-14 w-14 overflow-hidden rounded-lg border border-zinc-300"
            >
              <Image unoptimized src={url} alt="" fill className="object-cover" sizes="48px" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
