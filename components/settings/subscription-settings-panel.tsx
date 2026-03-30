"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRight, CalendarClock, Sparkles } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { settingsCardClassName, settingsInsetSurfaceClassName } from "@/lib/settings-ui";
import { cn } from "@/lib/utils";

type SubscriptionSettingsPanelProps = {
  locale: string;
  isSubscribed: boolean;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
  endsAt: Date | null;
};

function subscriptionBadgeVariant(
  status: string | null,
  active: boolean,
): "default" | "secondary" | "destructive" | "outline" {
  if (!active) return "outline";
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "active" || normalized === "trialing") return "default";
  if (normalized === "canceled" || normalized === "unpaid") return "destructive";
  return "secondary";
}

export function SubscriptionSettingsPanel({
  locale,
  isSubscribed,
  subscriptionStatus,
  currentPeriodEnd,
  endsAt,
}: SubscriptionSettingsPanelProps) {
  const t = useTranslations("settings");
  const [portalPending, setPortalPending] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const statusKey = (subscriptionStatus ?? "").toLowerCase();
  const statusLabel = (() => {
    if (!isSubscribed) return t("subscriptionStatusNone");
    if (statusKey === "active") return t("subscriptionStatusActive");
    if (statusKey === "trialing") return t("subscriptionStatusTrialing");
    if (statusKey === "canceled") return t("subscriptionStatusCanceled");
    if (statusKey === "unpaid") return t("subscriptionStatusUnpaid");
    if (statusKey === "past_due") return t("subscriptionStatusPastDue");
    if (statusKey === "incomplete") return t("subscriptionStatusIncomplete");
    return subscriptionStatus ?? t("subscriptionStatusUnknown");
  })();

  const formatDate = (value: Date | null) => {
    if (!value) return "—";
    return value.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  async function handleOpenPortal() {
    setPortalError(null);
    setPortalPending(true);
    try {
      const result = await authClient.customer.portal();
      if (result.error) {
        setPortalError(
          typeof result.error.message === "string"
            ? result.error.message
            : t("subscriptionPortalError"),
        );
        setPortalPending(false);
        return;
      }
      const portalUrl = result.data?.url;
      if (portalUrl) {
        window.location.assign(portalUrl);
        return;
      }
      setPortalError(t("subscriptionPortalError"));
    } catch {
      setPortalError(t("subscriptionPortalError"));
    } finally {
      setPortalPending(false);
    }
  }

  if (!isSubscribed) {
    return (
      <div className="space-y-6">
        <Card className={cn(settingsCardClassName, "relative overflow-hidden")}>
          <div
            className="pointer-events-none absolute -right-20 top-0 h-48 w-48 rounded-full bg-accent-gradient opacity-[0.12] blur-3xl dark:opacity-[0.16]"
            aria-hidden
          />
          <CardHeader className="relative border-b border-border/50 bg-muted/[0.08] pb-5 dark:bg-muted/[0.06]">
            <CardTitle className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-gradient-subtle ring-1 ring-border/50">
                <Sparkles className="size-5 text-foreground/85" aria-hidden />
              </span>
              {t("subscriptionTitle")}
            </CardTitle>
            <CardDescription>{t("subscriptionUpgradeDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="relative grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
            <Link
              href="/api/checkout/start?slug=monthly"
              className={cn(
                "feature-card-muted group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all",
                "hover:-translate-y-0.5 hover:shadow-md",
              )}
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent-gradient opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-[0.1]"
                aria-hidden
              />
              <div className="relative">
                <p className="font-heading text-lg font-semibold tracking-tight text-foreground">
                  {t("subscriptionPlanMonthly")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t("subscriptionPlanMonthlyHint")}
                </p>
              </div>
              <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gradient">
                {t("subscriptionUpgradeButton")}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
            <Link
              href="/api/checkout/start?slug=yearly"
              className={cn(
                "feature-card-muted group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all",
                "hover:-translate-y-0.5 hover:shadow-md",
              )}
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent-gradient opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-[0.1]"
                aria-hidden
              />
              <div className="relative">
                <p className="font-heading text-lg font-semibold tracking-tight text-foreground">
                  {t("subscriptionPlanYearly")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t("subscriptionPlanYearlyHint")}
                </p>
              </div>
              <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gradient">
                {t("subscriptionUpgradeButton")}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className={cn(settingsCardClassName)}>
      <CardHeader className="border-b border-border/50 bg-muted/[0.08] pb-5 dark:bg-muted/[0.06]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{t("subscriptionTitle")}</CardTitle>
            <CardDescription>{t("subscriptionDescription")}</CardDescription>
          </div>
          <Badge
            variant={subscriptionBadgeVariant(subscriptionStatus, isSubscribed)}
            className="w-fit shrink-0 px-3 py-1 text-xs uppercase tracking-wide"
          >
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className={cn(settingsInsetSurfaceClassName, "flex gap-3 p-4")}>
            <CalendarClock className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("subscriptionPeriodEnd")}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formatDate(currentPeriodEnd)}
              </p>
            </div>
          </div>
          <div className={cn(settingsInsetSurfaceClassName, "flex gap-3 p-4")}>
            <CalendarClock className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("subscriptionEndsAt")}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formatDate(endsAt)}
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            settingsInsetSurfaceClassName,
            "border-dashed border-border/70 p-4 sm:p-5",
          )}
        >
          <p className="text-sm font-medium text-foreground">{t("subscriptionManageDescription")}</p>
          <Button
            type="button"
            className="mt-4 w-full sm:w-auto"
            disabled={portalPending}
            onClick={handleOpenPortal}
          >
            {portalPending ? t("subscriptionOpeningPortal") : t("subscriptionManageButton")}
          </Button>
          {portalError ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {portalError}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
