"use client";

import { useTranslations } from "next-intl";
import { MessageSquare, Rocket, Wand2 } from "lucide-react";
import { BentoTile } from "./bento-tile";
import { plansUrlWithReturn } from "@/lib/plans";
import { LockedToolActionCard } from "./locked-tool-action-card";
import { ToolActionCard } from "./tool-action-card";
import { cn } from "@/lib/utils";

export function ToolsTile({
  contextId,
  contextName,
  isSubscribed,
}: {
  contextId: string;
  contextName: string;
  isSubscribed: boolean;
}) {
  const tCtx = useTranslations("dna.contextResult");
  const tDashboard = useTranslations("dashboard");
  return (
    <BentoTile
      label={tCtx("workspaceTools")}
      className={cn(
        "col-span-full flex flex-col",
        "border-border/70 bg-card",
        "shadow-[0_1px_0_0_oklch(1_0_0_/0.06)_inset,0_20px_50px_-28px_oklch(0.55_0.14_280_/0.14)]",
        "dark:border-border/60 dark:shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05),0_24px_56px_-28px_oklch(0_0_0_/0.45)]",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-1/2 size-[min(100vw,20rem)] -translate-y-1/2 rounded-full bg-primary/[0.055] blur-[72px] dark:bg-primary/[0.08]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-cyan-500/[0.04] blur-[64px] dark:bg-cyan-400/[0.06]"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 p-5 sm:gap-7 sm:p-7 lg:flex-row lg:items-stretch lg:gap-10 lg:p-8">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3.5">
          <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-border/60 bg-muted/35 px-3 py-1.5 shadow-sm backdrop-blur-sm dark:bg-muted/25">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/15 dark:from-primary/25 dark:to-primary/10">
              <Rocket className="size-3.5 text-primary" strokeWidth={2} aria-hidden />
            </span>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {tCtx("workspaceTools")}
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl sm:leading-snug">
              {tCtx("launchWithDna")}
            </h2>
            <p className="max-w-[42ch] text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem] sm:leading-relaxed">
              {tCtx("launchWithDnaDescription", { brandName: contextName })}
            </p>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col justify-center lg:max-w-[min(100%,26rem)] lg:shrink-0">
          <div
            className={cn(
              "rounded-[1.125rem] border border-border/55 bg-background/55 p-2 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)]",
              "backdrop-blur-md dark:border-border/45 dark:bg-background/30 dark:shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]",
            )}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
              {isSubscribed ? (
                <ToolActionCard
                  href={`/dashboard/chat?contextId=${contextId}`}
                  icon={MessageSquare}
                  title={tCtx("openInChat")}
                  primary
                  iconAnimationDelaySeconds={0}
                />
              ) : (
                <LockedToolActionCard
                  icon={MessageSquare}
                  title={tCtx("openInChat")}
                  primary
                  iconAnimationDelaySeconds={0}
                  unlockHref={plansUrlWithReturn(`/dashboard/chat?contextId=${contextId}`)}
                  activatePlanLabel={tDashboard("activatePlan")}
                  unlockAriaLabel={tDashboard("activatePlanUnlockAria", { title: tCtx("openInChat") })}
                />
              )}
              {isSubscribed ? (
                <ToolActionCard
                  href={`/dashboard/ad-creatives?contextId=${contextId}`}
                  icon={Wand2}
                  title={tCtx("openAdCreatives")}
                  iconAnimationDelaySeconds={0.35}
                />
              ) : (
                <LockedToolActionCard
                  icon={Wand2}
                  title={tCtx("openAdCreatives")}
                  iconAnimationDelaySeconds={0.35}
                  unlockHref={plansUrlWithReturn(`/dashboard/ad-creatives?contextId=${contextId}`)}
                  activatePlanLabel={tDashboard("activatePlan")}
                  unlockAriaLabel={tDashboard("activatePlanUnlockAria", { title: tCtx("openAdCreatives") })}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </BentoTile>
  );
}
