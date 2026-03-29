"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { getReadableTextColor } from "./lib/brand-color-utils";

export function HexSwatch({
  label,
  hex,
}: {
  label: string;
  hex: string;
}) {
  const tCtx = useTranslations("dna.contextResult");
  const textColor = getReadableTextColor(hex);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
    } catch {
      /* noop */
    } finally {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1400);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="group/swatch relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl p-5 transition-transform active:scale-[0.97] sm:p-6"
      style={{ backgroundColor: hex }}
      title={tCtx("copyColorTitle", { hex })}
      aria-label={tCtx("copyColorAria", { label, hex })}
    >
      <span
        className="text-xs font-bold uppercase tracking-[0.18em] opacity-75"
        style={{ color: textColor }}
      >
        {label}
      </span>
      <span
        className="font-mono text-base font-semibold tracking-wider sm:text-lg"
        style={{ color: textColor }}
      >
        {hex.toUpperCase()}
      </span>
      <span
        className={cn(
          "absolute right-2 top-2 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider transition-opacity",
          copied
            ? "opacity-100"
            : "opacity-0 group-hover/swatch:opacity-100",
        )}
        style={{
          color: textColor,
          backgroundColor:
            textColor === "#0B0F19"
              ? "rgba(255,255,255,0.4)"
              : "rgba(0,0,0,0.35)",
        }}
      >
        {copied ? (
          <>
            <Check className="size-3" />
            {tCtx("copied")}
          </>
        ) : (
          <>
            <Copy className="size-3" />
            {tCtx("copy")}
          </>
        )}
      </span>
    </button>
  );
}
