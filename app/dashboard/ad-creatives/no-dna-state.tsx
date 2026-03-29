"use client";

import Link from "next/link";
import { Dna, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { studioContentCn, studioScrollCn, studioShellCn } from "./ad-creatives-constants";

export function NoDnaState() {
  const t = useTranslations("adCreatives.noData");

  return (
    <div className={studioShellCn}>
      <div className={studioScrollCn}>
        <div className={studioContentCn}>
          <div className="flex min-h-[50vh] flex-col items-center justify-center py-12 sm:min-h-[55vh] sm:py-16">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-muted/20 p-8 text-center shadow-lg ring-1 ring-border/30 sm:p-10">
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" aria-hidden />
              <div className="absolute -bottom-10 -left-10 size-36 rounded-full bg-primary/5 blur-3xl" aria-hidden />
              <div className="relative">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20">
                  <Dna className="size-7" strokeWidth={1.5} />
                </span>
                <p className="mt-5 font-heading text-lg font-semibold tracking-tight text-foreground">
                  {t("title")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t("description")}
                </p>
                <Link
                  href="/dashboard/dna"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "mt-8 inline-flex rounded-xl px-6 shadow-md",
                  )}
                >
                  <Sparkles className="mr-2 size-4" />
                  {t("action")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
