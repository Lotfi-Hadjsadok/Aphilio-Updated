"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteSavedContext } from "@/app/actions/scrape";
import type { DeleteDNAState, ScrapeResult } from "@/types/scrape";
import { Button, buttonVariants } from "@/components/ui/button";
import { DashboardBackIcon } from "@/components/dashboard/dashboard-back-icon";
import {
  dashboardToolHeaderActionsClass,
  dashboardToolHeaderBarClass,
  dashboardToolHeaderPrimaryClass,
  dashboardToolHeaderRowClass,
} from "@/lib/dashboard-tool-layout";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dna, Globe, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveBrandColors } from "./lib/brand-color-utils";
import { HeroBanner } from "./hero-banner";
import { ColorsTile } from "./colors-tile";
import { TypographyTile } from "./typography-tile";
import { IdentityTile } from "./identity-tile";
import { VoiceTile } from "./voice-tile";
import { MarketingAnglesTile } from "./marketing-angles-tile";
import { ToolsTile } from "./tools-tile";
import { APHILIO_GA_EVENTS } from "@/lib/analytics/events";
import { trackGaEvent } from "@/lib/analytics/track-client";
import { DeleteDnaButton } from "./delete-dna-button";
import { LogoutButton } from "@/components/logout-button";

const initialDeleteState: DeleteDNAState = {};

export function ResultExperience({
  result,
  onRescan,
  fromLibrary,
  backHref = "/dashboard",
  isSubscribed,
}: {
  result: ScrapeResult;
  onRescan?: () => void;
  fromLibrary?: boolean;
  backHref?: string;
  isSubscribed: boolean;
}) {
  const tCommon = useTranslations("common");
  const tDna = useTranslations("dna");
  const tCtx = useTranslations("dna.contextResult");
  const router = useRouter();
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteSavedContext,
    initialDeleteState,
  );

  useEffect(() => {
    if (deleteState.deletedContextId) {
      trackGaEvent(APHILIO_GA_EVENTS.brandDnaDelete, {
        surface: fromLibrary ? "library_context_detail" : "dna_result_view",
      });
      router.push(backHref);
    }
  }, [deleteState.deletedContextId, router, backHref, fromLibrary]);

  const primary = result.branding
    ? resolveBrandColors(result.branding).primary
    : null;

  const backAriaLabel =
    backHref === "/dashboard" ? tCommon("backToDashboard") : tDna("backToBrandDna");

  const newUrlEl = onRescan ? (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onRescan}
      className="shrink-0 gap-1.5 rounded-lg"
    >
      <Globe className="size-3.5" />
      {tCtx("reExtract")}
    </Button>
  ) : (
    <Link
      href="/dashboard/dna"
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg",
      )}
    >
      <Globe className="size-3.5" />
      {tCtx("newUrl")}
    </Link>
  );

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <header className={cn(dashboardToolHeaderBarClass, "relative z-10")}>
        <div className={dashboardToolHeaderRowClass}>
          <div className={cn(dashboardToolHeaderPrimaryClass, "gap-3")}>
            <DashboardBackIcon
              href={backHref}
              ariaLabel={backAriaLabel}
              title={tCommon("back")}
            />

            <Separator orientation="vertical" className="hidden h-7 bg-border/50 sm:block" />

            <div className="flex min-w-0 items-center gap-2">
              <Dna className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <span className="truncate text-sm font-medium text-foreground sm:text-base">
                {result.name}
              </span>
              {fromLibrary && (
                <Badge
                  variant="secondary"
                  className="shrink-0 gap-1 border border-border/50 bg-muted/40 text-[0.55rem]"
                >
                  <Library className="size-2" />
                  {tCtx("savedBadge")}
                </Badge>
              )}
            </div>
          </div>

          <div className={dashboardToolHeaderActionsClass}>
            {fromLibrary && (
              <DeleteDnaButton
                contextId={result.id}
                contextName={result.name}
                deleteFormAction={deleteFormAction}
                deletePending={deletePending}
              />
            )}
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 shrink-0 px-2.5 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {tCommon("dashboard")}
            </Link>
            {newUrlEl}
            <LogoutButton
              className="h-8 px-2.5 text-xs"
              label={tCommon("logout")}
            />
          </div>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        {primary && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div
              className="absolute -left-32 -top-20 h-80 w-80 rounded-full opacity-[0.08] blur-[100px]"
              style={{ backgroundColor: primary }}
            />
            <div
              className="absolute -right-24 bottom-0 h-64 w-64 rounded-full opacity-[0.06] blur-[80px]"
              style={{ backgroundColor: primary }}
            />
          </div>
        )}

        <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <ToolsTile
              contextId={result.id}
              contextName={result.name}
              isSubscribed={isSubscribed}
            />

            <HeroBanner result={result} primary={primary} />

            {result.branding && (
              <ColorsTile branding={result.branding} />
            )}

            {result.branding && (
              <IdentityTile branding={result.branding} />
            )}

            {result.branding && (
              <TypographyTile
                typography={result.branding.typography}
              />
            )}

            <VoiceTile personality={result.personality ?? null} />

            <MarketingAnglesTile
              angles={result.marketingAngles ?? null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
