import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { BrandLogoLink } from "@/components/brand-logo";
import { PricingPlansSection } from "@/components/landing/pricing-plans-section";
import { LanguageSwitcher } from "@/components/language-switcher";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { getSiteOrigin } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  const siteOrigin = getSiteOrigin();
  return {
    title: t("plansTitle"),
    description: t("plansDescription"),
    alternates: {
      canonical: `${siteOrigin}/plans`,
    },
  };
}

export default async function PlansPage() {
  const siteOrigin = getSiteOrigin();
  const locale = await getLocale();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const t = await getTranslations("landing");
  const tCommon = await getTranslations("common");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Plans & pricing",
    url: `${siteOrigin}/plans`,
    isPartOf: { "@type": "WebSite", name: "Aphilio", url: siteOrigin },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="landing-grid-bg relative flex min-h-[100dvh] flex-col overflow-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="glow-orb absolute -left-32 -top-16 h-[36rem] w-[36rem] bg-accent-gradient opacity-[0.22] sm:opacity-[0.28] animate-pulse-glow" />
          <div
            className="glow-orb absolute -right-24 top-1/4 h-96 w-96 bg-accent-gradient opacity-[0.18] sm:opacity-[0.22]"
            style={{ animationDelay: "1.2s" }}
          />
        </div>

        <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-5 sm:px-10 sm:py-8">
          <div className="flex w-full min-w-0 items-center justify-between gap-3 sm:contents">
            <BrandLogoLink priority size="landing" className="shrink-0" />
            <div className="flex min-h-0 min-w-0 shrink-0 items-center justify-end gap-6 sm:min-w-0 sm:flex-1 sm:justify-center sm:mx-4 sm:gap-7">
              <LanguageSwitcher currentLocale={locale} variant="prominent" />
              <Link
                href="/"
                className="hidden text-base font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                {t("plansBackHome")}
              </Link>
            </div>
          </div>
          {session ? (
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "h-10 w-fit shrink-0 self-center gap-1.5 rounded-lg px-4 text-sm font-medium shadow-sm backdrop-blur-sm sm:h-11 sm:gap-2 sm:rounded-xl sm:px-6 sm:text-base",
              )}
            >
              {tCommon("dashboard")}
              <ArrowRight className="size-3.5 opacity-60 sm:size-4" aria-hidden />
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "h-10 w-fit shrink-0 self-center gap-1.5 rounded-lg px-4 text-sm font-medium shadow-sm backdrop-blur-sm sm:h-11 sm:gap-2 sm:rounded-xl sm:px-6 sm:text-base",
              )}
            >
              {tCommon("signIn")}
              <ArrowRight className="size-3.5 opacity-60 sm:size-4" aria-hidden />
            </Link>
          )}
        </header>

        <main
          id="main-content"
          className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pb-24 pt-10 sm:px-10 sm:pb-32 sm:pt-14 lg:pb-36"
        >
          <div className="mb-12 text-center sm:mb-14">
            <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
              {t("pricingTitle")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:mt-6 sm:text-lg lg:text-xl">
              {t("pricingSubtitle")}
            </p>
          </div>

          <PricingPlansSection
            id="pricing"
            className="pb-8"
            showSectionHeader={false}
          />
        </main>
      </div>
    </>
  );
}
