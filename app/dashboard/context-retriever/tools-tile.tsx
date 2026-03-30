"use client";

import { useTranslations } from "next-intl";
import { MessageSquare, Wand2, Wrench } from "lucide-react";
import { BentoTile } from "./bento-tile";
import { LockedToolActionCard, ToolActionCard } from "./tool-action-card";

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
      className="col-span-full flex flex-col"
    >
      <div className="flex items-center gap-2 px-5 pt-5 sm:px-6 sm:pt-6">
        <Wrench className="size-4 text-muted-foreground/80" strokeWidth={1.75} />
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground/80">
          {tCtx("launchWithDna")}
        </span>
        <span className="ml-1 rounded-full bg-muted/70 px-2 py-0.5 font-mono text-[0.65rem] font-medium text-muted-foreground ring-1 ring-border/50">
          {contextName}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-5 pt-3 sm:flex-row sm:p-6 sm:pt-3">
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
            activatePlanLabel={tDashboard("activatePlan")}
            unlockAriaLabel={tDashboard("activatePlanUnlockAria", { title: tCtx("openAdCreatives") })}
          />
        )}
      </div>
    </BentoTile>
  );
}
