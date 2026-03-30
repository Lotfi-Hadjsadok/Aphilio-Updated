import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { BrandLogoLink } from "@/components/brand-logo";
import { AccountSettingsCard } from "@/components/settings/account-settings-card";
import { BillingSettingsForm } from "@/components/settings/billing-settings-form";
import { CreditsLockedCta } from "@/components/settings/credits-locked-cta";
import { PreferencesSettingsCard } from "@/components/settings/preferences-settings-card";
import { SettingsShell } from "@/components/settings/settings-shell";
import { SubscriptionSettingsPanel } from "@/components/settings/subscription-settings-panel";
import {
  dashboardNavFocusRingClass,
  dashboardNavPillLinkClassName,
} from "@/components/dashboard-back-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LocaleSync } from "@/components/locale-sync";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { getUserSubscriptionStatus } from "@/lib/polar/subscription";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata() {
  const t = await getTranslations("metadata");
  return {
    title: t("settingsTitle"),
    description: t("settingsDescription"),
  };
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const { tab: tabParam } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      onboardingCompleted: true,
      preferredLanguage: true,
      aphilioCreditsBalance: true,
      allowCreditOverage: true,
      maxCreditOverageStoredUnits: true,
      createdAt: true,
      polarSubscriptionStatus: true,
      polarSubscriptionCurrentPeriodEnd: true,
      polarSubscriptionEndsAt: true,
      hasActiveSubscription: true,
    },
  });

  if (!user?.onboardingCompleted) {
    redirect("/dashboard/onboarding");
  }

  const isSubscribed = await getUserSubscriptionStatus(session.user.id);

  const accountRecord = await prisma.account.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { providerId: true },
  });

  const creditsBalanceDisplay = (user.aphilioCreditsBalance / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const locale = await getLocale();
  const t = await getTranslations("settings");
  const tDashboard = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");

  const displayName = session.user.name ?? session.user.email;
  const providerId = accountRecord?.providerId ?? "";

  const providerLabel = (() => {
    if (providerId === "google") return t("accountProviderGoogle");
    if (providerId === "credential") return t("accountProviderCredential");
    if (providerId.length > 0) return providerId;
    return t("accountProviderUnknown");
  })();

  return (
    <main className="landing-grid-bg relative flex h-full min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background text-foreground">
      <LocaleSync preferredLanguage={user.preferredLanguage ?? ""} />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute -left-32 top-0 h-96 w-96 bg-accent-gradient opacity-[0.14] sm:h-[28rem] sm:w-[28rem]" />
        <div className="glow-orb absolute -right-24 bottom-10 h-80 w-80 bg-accent-gradient opacity-[0.1] sm:bottom-20" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
      </div>

      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-8 sm:py-8">
        <header className="flex w-full min-w-0 flex-col gap-3 overflow-x-hidden sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <BrandLogoLink className="min-w-0 max-w-full shrink-0 self-start sm:self-auto" />
          <div className="flex min-h-0 min-w-0 w-full flex-1 items-center justify-center sm:mx-4 sm:w-auto">
            <LanguageSwitcher currentLocale={locale} />
          </div>
          <div className="flex w-full min-w-0 shrink-0 flex-wrap items-center justify-center gap-2 self-center sm:w-fit sm:self-auto">
            <Link href="/dashboard" className={cn(dashboardNavPillLinkClassName, "w-fit")}>
              {tCommon("dashboard")}
            </Link>
            <LogoutButton />
          </div>
        </header>

        <div className="mt-6 sm:mt-8">
          <Link
            href="/dashboard"
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              dashboardNavFocusRingClass,
            )}
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("backToDashboard")}
          </Link>
        </div>

        <header className="mt-6 sm:mt-8">
          <div className="flex flex-wrap items-start gap-4 sm:items-center sm:gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient-subtle shadow-lg ring-1 ring-border/60">
              <Settings className="h-6 w-6 text-foreground" strokeWidth={1.65} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {t("pageTitle")}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t("pageSubtitle")}
              </p>
            </div>
          </div>
        </header>

        <section className="min-w-0" aria-label={t("settingsNavAria")}>
          <SettingsShell
            initialTab={tabParam}
            accountPanel={
              <AccountSettingsCard
                displayName={displayName}
                email={session.user.email}
                imageUrl={session.user.image}
                memberSince={user.createdAt}
                providerLabel={providerLabel}
                locale={locale}
              />
            }
            subscriptionPanel={
              <SubscriptionSettingsPanel
                locale={locale}
                isSubscribed={isSubscribed}
                subscriptionStatus={user.polarSubscriptionStatus}
                currentPeriodEnd={user.polarSubscriptionCurrentPeriodEnd}
                endsAt={user.polarSubscriptionEndsAt}
              />
            }
            creditsPanel={
              isSubscribed ? (
                <BillingSettingsForm
                  initialAllowCreditOverage={user.allowCreditOverage}
                  initialMaxCreditOverageStoredUnits={user.maxCreditOverageStoredUnits}
                  creditsBalanceDisplay={creditsBalanceDisplay}
                />
              ) : (
                <CreditsLockedCta
                  title={t("creditsLockedTitle")}
                  description={t("creditsLockedDescription")}
                  buttonLabel={t("creditsSubscribeButton")}
                />
              )
            }
            preferencesPanel={<PreferencesSettingsCard currentLocale={locale} />}
          />
        </section>
      </div>
    </main>
  );
}
