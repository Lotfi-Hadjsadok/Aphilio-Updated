import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Dna,
  Images,
  LayoutTemplate,
  Lock,
  MessageSquare,
  Settings,
  Sparkles,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { BrandLogoLink } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  dashboardNavFocusRingClass,
  dashboardNavPillLinkClassName,
} from "@/components/dashboard-back-link";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { LocaleSync } from "@/components/locale-sync";
import { LogoutButton } from "@/components/logout-button";
import { getUserSubscriptionStatus } from "@/lib/polar/subscription";
import { CheckoutTrackedAnchor } from "@/components/analytics/checkout-tracked-anchor";

type ToolCardProps = {
  href: string;
  title: string;
  description?: string;
  actionLabel: string;
  icon: React.ReactNode;
  accent?: string;
};

function ToolCard({
  href,
  title,
  description,
  actionLabel,
  icon,
  accent,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className={cn("group block h-full", dashboardNavFocusRingClass)}
    >
      <div className="dashboard-tool-card flex h-full flex-col">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent-gradient opacity-[0.08] blur-3xl transition-opacity duration-500 group-hover:opacity-[0.28]"
          aria-hidden
        />
        <div className="relative flex h-full flex-col gap-4 p-5 sm:p-6">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner ring-1 ring-border/80",
              accent ?? "bg-accent-gradient-subtle",
            )}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {title}
            </p>
            {description ? (
              <p className="text-[0.8rem] leading-relaxed text-muted-foreground sm:text-sm">{description}</p>
            ) : null}
          </div>
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-gradient">
            {actionLabel}
            <ArrowRight
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </p>
        </div>
      </div>
    </Link>
  );
}

type LockedToolCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  checkoutSlug: string;
  activatePlanLabel: string;
  unlockAriaLabel: string;
};

function LockedToolCard({
  title,
  description,
  icon,
  checkoutSlug,
  activatePlanLabel,
  unlockAriaLabel,
}: LockedToolCardProps) {
  return (
    <CheckoutTrackedAnchor
      planSlug={checkoutSlug}
      href={`/api/checkout/start?slug=${checkoutSlug}`}
      className={cn("group block h-full", dashboardNavFocusRingClass)}
      aria-label={unlockAriaLabel}
    >
      <div className="dashboard-tool-card relative flex h-full flex-col overflow-hidden">
        {/* Blurred / dimmed base content */}
        <div className="relative flex h-full flex-col gap-4 p-5 opacity-50 blur-[0.5px] transition-all duration-300 group-hover:opacity-30 group-hover:blur-[1px] sm:p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner ring-1 ring-border/80 bg-accent-gradient-subtle">
            {icon}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {title}
            </p>
            <p className="text-[0.8rem] leading-relaxed text-muted-foreground sm:text-sm">
              {description}
            </p>
          </div>
        </div>

        {/* Lock overlay — always visible, animate on hover */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 transition-all duration-300">
          {/* Padlock icon */}
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/70 ring-1 ring-border/60 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-background/90 group-hover:ring-border">
            <Lock
              className="size-5 text-muted-foreground transition-colors duration-300 group-hover:text-foreground"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>

          {/* Locked CTA label — slides up on hover */}
          <div className="translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-border/60 backdrop-blur-sm">
              <Sparkles className="size-3 text-amber-400" aria-hidden />
              {activatePlanLabel}
            </span>
          </div>
        </div>
      </div>
    </CheckoutTrackedAnchor>
  );
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true, preferredLanguage: true },
  });

  if (!user?.onboardingCompleted) {
    redirect("/dashboard/onboarding");
  }

  const isSubscribed = await getUserSubscriptionStatus(session.user.id);

  const displayName = session.user.name ?? session.user.email;
  const locale = await getLocale();
  const t = await getTranslations();
  const tCommon = await getTranslations("common");

  return (
    <main className="landing-grid-bg relative flex h-full min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background text-foreground">
      <LocaleSync preferredLanguage={user?.preferredLanguage ?? ""} />
      {/* Decorative glow orbs — same style as onboarding */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute -left-32 top-0 h-96 w-96 bg-accent-gradient opacity-[0.18] sm:h-[28rem] sm:w-[28rem]" />
        <div className="glow-orb absolute -right-24 bottom-10 h-80 w-80 bg-accent-gradient opacity-[0.14] sm:bottom-20" />
        <div className="glow-orb absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-accent-gradient opacity-[0.06]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
      </div>

      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col px-4 pt-6 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-8">
        {/* Top bar: logo + language + library */}
        <header className="flex w-full min-w-0 flex-col gap-3 overflow-x-hidden sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <BrandLogoLink className="min-w-0 max-w-full shrink-0 self-start sm:self-auto" />
          <div className="flex min-h-0 min-w-0 w-full flex-1 items-center justify-center sm:mx-4 sm:w-auto">
            <LanguageSwitcher currentLocale={locale} />
          </div>
          <div className="flex w-full min-w-0 shrink-0 flex-wrap items-center justify-center gap-2 self-center sm:w-fit sm:self-auto">
            {isSubscribed ? (
              <>
                <Link
                  href="/dashboard/library"
                  className={cn(dashboardNavPillLinkClassName, "w-fit")}
                >
                  <Images className="size-4" strokeWidth={1.75} />
                  {t("dashboard.library")}
                </Link>
                <Link
                  href="/dashboard/settings"
                  className={cn(dashboardNavPillLinkClassName, "w-fit")}
                >
                  <Settings className="size-4" strokeWidth={1.75} />
                  {t("dashboard.settings")}
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard/settings" className={cn(dashboardNavPillLinkClassName, "w-fit")}>
                  <Settings className="size-4" strokeWidth={1.75} />
                  {t("dashboard.settings")}
                </Link>
                <CheckoutTrackedAnchor
                  planSlug="monthly"
                  href="/api/checkout/start?slug=monthly"
                  className={cn(
                    dashboardNavPillLinkClassName,
                    "w-fit opacity-90 ring-1 ring-border/40",
                  )}
                  aria-label={t("dashboard.libraryLockedAria")}
                >
                  <Lock className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
                  <Images className="size-4 opacity-70" strokeWidth={1.75} aria-hidden />
                  {t("dashboard.library")}
                </CheckoutTrackedAnchor>
              </>
            )}
            <LogoutButton />
          </div>
        </header>

        {/* Welcome — compact */}
        <header className="mt-6 space-y-2 sm:mt-8">
          <h1 className="font-heading text-balance text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            {t.rich("dashboard.welcomeBack", {
              name: displayName,
              highlight: (chunks) => <span className="text-gradient">{chunks}</span>,
            })}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("dashboard.subtitle")}
          </p>
        </header>

        {/* Tools grid — DNA + Chat + Ad Creatives on the same row */}
        <section
          className="mt-8 flex min-h-0 flex-1 flex-col sm:mt-10"
          aria-label={tCommon("workspaceToolsAria")}
        >
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3 lg:items-stretch lg:content-stretch">
            <ToolCard
              href="/dashboard/dna"
              title={t("dashboard.tools.dna.title")}
              description={t("dashboard.tools.dna.description")}
              actionLabel={t("dashboard.tools.dna.action")}
              icon={<Dna className="h-6 w-6 text-foreground" strokeWidth={1.65} aria-hidden />}
            />
            {isSubscribed ? (
              <ToolCard
                href="/dashboard/chat"
                title={t("dashboard.tools.chat.title")}
                description={t("dashboard.tools.chat.description")}
                actionLabel={t("dashboard.tools.chat.action")}
                icon={<MessageSquare className="h-6 w-6 text-foreground" strokeWidth={1.65} aria-hidden />}
              />
            ) : (
              <LockedToolCard
                title={t("dashboard.tools.chat.title")}
                description={t("dashboard.tools.chat.description")}
                icon={<MessageSquare className="h-6 w-6 text-foreground/50" strokeWidth={1.65} aria-hidden />}
                checkoutSlug="monthly"
                activatePlanLabel={t("dashboard.activatePlan")}
                unlockAriaLabel={t("dashboard.activatePlanUnlockAria", {
                  title: t("dashboard.tools.chat.title"),
                })}
              />
            )}
            {isSubscribed ? (
              <ToolCard
                href="/dashboard/ad-creatives"
                title={t("dashboard.tools.adCreatives.title")}
                description={t("dashboard.tools.adCreatives.description")}
                actionLabel={t("dashboard.tools.adCreatives.action")}
                icon={<LayoutTemplate className="h-6 w-6 text-foreground" strokeWidth={1.65} aria-hidden />}
              />
            ) : (
              <LockedToolCard
                title={t("dashboard.tools.adCreatives.title")}
                description={t("dashboard.tools.adCreatives.description")}
                icon={<LayoutTemplate className="h-6 w-6 text-foreground/50" strokeWidth={1.65} aria-hidden />}
                checkoutSlug="monthly"
                activatePlanLabel={t("dashboard.activatePlan")}
                unlockAriaLabel={t("dashboard.activatePlanUnlockAria", {
                  title: t("dashboard.tools.adCreatives.title"),
                })}
              />
            )}
          </div>
        </section>

        {/* Workflow hint — desktop / tablet only */}
        <footer className="mt-auto hidden shrink-0 justify-center pt-6 sm:flex sm:pt-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground/60 sm:gap-8 sm:text-xs">
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted/60 text-[0.6rem] font-bold text-muted-foreground ring-1 ring-border/50">
                1
              </span>
              {t("dashboard.workflow.capture")}
            </span>
            <ArrowRight className="size-3 shrink-0 text-muted-foreground/40" aria-hidden />
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted/60 text-[0.6rem] font-bold text-muted-foreground ring-1 ring-border/50">
                2
              </span>
              {t("dashboard.workflow.create")}
            </span>
            <ArrowRight className="size-3 shrink-0 text-muted-foreground/40" aria-hidden />
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted/60 text-[0.6rem] font-bold text-muted-foreground ring-1 ring-border/50">
                3
              </span>
              {t("dashboard.workflow.collect")}
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
