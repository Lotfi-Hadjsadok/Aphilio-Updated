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

        <header className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-8 sm:py-7">
          <BrandLogoLink priority className="shrink-0" />
          <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center gap-6 sm:mx-4">
            <LanguageSwitcher currentLocale={locale} />
            <Link
              href="/"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              {t("plansBackHome")}
            </Link>
          </div>
          {session ? (
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-fit shrink-0 self-center gap-1.5 rounded-xl px-5 text-sm font-medium shadow-sm backdrop-blur-sm",
              )}
            >
              {tCommon("dashboard")}
              <ArrowRight className="size-3.5 opacity-60" aria-hidden />
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-fit shrink-0 self-center gap-1.5 rounded-xl px-5 text-sm font-medium shadow-sm backdrop-blur-sm",
              )}
            >
              {tCommon("signIn")}
              <ArrowRight className="size-3.5 opacity-60" aria-hidden />
            </Link>
          )}
        </header>

        <main
          id="main-content"
          className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-20 pt-8 sm:px-8 sm:pb-28 sm:pt-12 lg:pb-32"
        >
          <div className="mb-10 text-center">
            <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              {t("pricingTitle")}
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground sm:text-[1.0625rem]">
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
