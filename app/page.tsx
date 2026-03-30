import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Globe,
  LayoutGrid,
  ScanSearch,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { BrandLogoLink } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Aphilio: Brand DNA Extraction & On-Brand Ad Creative Generator",
    description:
      "Extract your brand DNA from any URL (colors, fonts, logos, and voice), then generate on-brand ad creatives in multiple formats with AI.",
    alternates: {
      canonical: "/",
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Aphilio",
  description:
    "Brand intelligence platform that extracts brand DNA from any URL and generates on-brand ad creatives, images, and copy with AI.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: [
    {
      "@type": "Offer",
      price: "39",
      priceCurrency: "USD",
      name: "Monthly",
    },
    {
      "@type": "Offer",
      price: "240",
      priceCurrency: "USD",
      name: "Yearly",
      description: "Billed annually ($20 per month effective)",
    },
  ],
  featureList: [
    "Brand DNA extraction from any URL",
    "AI-powered ad creative generation",
    "Brand-aware AI chat with image generation",
    "Multiple ad formats: 1:1, 4:5, 9:16, 16:9",
    "Brand color, typography, and voice extraction",
    "Marketing angle generation",
  ],
};

const previewSwatches = [
  "bg-[#f97316]",
  "bg-[#a855f7]",
  "bg-[#3b82f6]",
  "bg-[#ec4899]",
  "bg-[#22c55e]",
] as const;

export default async function Home() {
  const locale = await getLocale();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const tCommon = await getTranslations("common");
  const t = await getTranslations("landing");
  const year = new Date().getFullYear();

  const steps = [
    {
      stepNumber: "01",
      title: t("step1Title"),
      description: t("step1Description"),
    },
    {
      stepNumber: "02",
      title: t("step2Title"),
      description: t("step2Description"),
    },
    {
      stepNumber: "03",
      title: t("step3Title"),
      description: t("step3Description"),
    },
  ];

  const trustItems = [
    { icon: Globe, label: t("trustBrowser") },
    { icon: Zap, label: t("trustDna") },
    { icon: CheckCircle2, label: t("trustWorkspace") },
  ];

  const whyItems = [
    {
      icon: Globe,
      title: t("whyItem1Title"),
      description: t("whyItem1Desc"),
    },
    {
      icon: ScanSearch,
      title: t("whyItem2Title"),
      description: t("whyItem2Desc"),
    },
    {
      icon: ShieldCheck,
      title: t("whyItem3Title"),
      description: t("whyItem3Desc"),
    },
    {
      icon: LayoutGrid,
      title: t("whyItem4Title"),
      description: t("whyItem4Desc"),
    },
  ];

  const proFeatures = [
    t("pricingProF1"),
    t("pricingProF2"),
    t("pricingProF3"),
    t("pricingProF4"),
    t("pricingProF5"),
    t("pricingProF6"),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="landing-grid-bg relative flex min-h-[100dvh] flex-col overflow-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="glow-orb absolute -left-28 -top-10 h-[28rem] w-[28rem] bg-accent-gradient opacity-[0.14] sm:opacity-[0.18]" />
          <div className="glow-orb absolute -right-20 top-1/3 h-80 w-80 bg-accent-gradient opacity-[0.12] sm:opacity-[0.16]" />
          <div className="glow-orb absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 bg-accent-gradient opacity-[0.08] sm:opacity-[0.12]" />
        </div>

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {t("skipToContent")}
        </a>

        {/* Header */}
        <header className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-8 sm:py-6">
          <BrandLogoLink priority className="shrink-0" />
          <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center gap-6 sm:mx-4">
            <LanguageSwitcher currentLocale={locale} />
            <Link
              href="#pricing"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              {t("navPricing")}
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
          className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-16 pt-4 sm:px-8 sm:pb-20 sm:pt-6 lg:pb-24 lg:pt-10"
        >
          {/* Hero */}
          <div className="flex flex-col items-center justify-center text-center">
            <span className="gradient-pill mb-6 tracking-[0.13em] sm:mb-7">
              {t("pill")}
            </span>

            <h1 className="font-heading max-w-4xl text-balance text-[2.35rem] font-semibold leading-[1.07] tracking-tight sm:text-[3.15rem] sm:leading-[1.06] lg:text-[4.25rem] lg:leading-[1.04]">
              {t("headlineBefore")}{" "}
              <span className="text-gradient">{t("headlineHighlight")}</span>{" "}
              {t("headlineAfter")}
            </h1>

            <p className="mx-auto mt-5 max-w-[52ch] text-pretty text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
              {t("subhead")}
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "h-12 min-w-[14rem] rounded-xl px-8 text-sm font-semibold shadow-md sm:text-base",
                )}
              >
                {t("ctaPrimary")}
                <ArrowRight className="ml-1.5 size-4" aria-hidden />
              </Link>
              <Link
                href="#pricing"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "h-12 rounded-xl text-sm text-muted-foreground hover:text-foreground sm:text-base",
                )}
              >
                {t("ctaSecondary")}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:mt-12">
              {trustItems.map(({ icon: TrustIcon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground sm:text-sm"
                >
                  <TrustIcon className="size-4 text-foreground/45" aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Product preview */}
          <section
            className="mx-auto mt-16 w-full max-w-3xl sm:mt-20 lg:mt-24"
            aria-labelledby="preview-title"
          >
            <div className="mb-6 space-y-2 text-center sm:mb-8">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                {t("previewEyebrow")}
              </p>
              <h2
                id="preview-title"
                className="font-heading text-lg font-semibold tracking-tight sm:text-xl"
              >
                {t("previewTitle")}
              </h2>
            </div>

            <div className="relative rounded-2xl border border-border/70 bg-card/60 p-1 shadow-lg shadow-black/5 ring-1 ring-foreground/[0.04] backdrop-blur-md dark:shadow-black/20">
              <div className="overflow-hidden rounded-[calc(var(--radius-xl)-2px)] border border-border/50 bg-muted/20">
                <div className="flex items-center gap-3 border-b border-border/60 bg-muted/30 px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="flex shrink-0 gap-1.5" aria-hidden>
                    <span className="size-2.5 rounded-full bg-red-400/90" />
                    <span className="size-2.5 rounded-full bg-amber-400/90" />
                    <span className="size-2.5 rounded-full bg-emerald-400/90" />
                  </div>
                  <div className="min-w-0 flex-1 truncate rounded-lg bg-background/80 px-3 py-2 text-left text-[0.7rem] text-muted-foreground shadow-inner ring-1 ring-border/40 sm:text-xs">
                    {t("previewUrlPlaceholder")}
                  </div>
                </div>
                <div className="grid gap-5 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6">
                  <div className="space-y-3 text-left">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("previewPaletteLabel")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {previewSwatches.map((swatchClass) => (
                        <span
                          key={swatchClass}
                          className={cn(
                            "size-9 rounded-xl shadow-sm ring-2 ring-background sm:size-10",
                            swatchClass,
                          )}
                          aria-hidden
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4 text-left">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("previewTypeLabel")}
                      </p>
                      <p className="font-heading mt-2 text-lg font-semibold tracking-tight sm:text-xl">
                        {t("previewTypeSample")}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/50 px-3 py-2.5 sm:px-4 sm:py-3">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("previewVoiceLabel")}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {t("previewVoiceSample")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section
            id="how-it-works"
            className="mx-auto mt-16 w-full max-w-5xl scroll-mt-24 sm:mt-20 lg:mt-28"
            aria-labelledby="how-it-works-title"
          >
            <div className="mb-8 space-y-2 text-center sm:mb-10">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                {t("howEyebrow")}
              </p>
              <h2
                id="how-it-works-title"
                className="font-heading text-xl font-semibold tracking-tight sm:text-2xl"
              >
                {t("howTitle")}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
              {steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-5 text-left shadow-sm ring-1 ring-foreground/[0.03] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-6"
                >
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent-gradient opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-[0.12]"
                    aria-hidden
                  />
                  <span className="font-heading text-3xl font-bold tabular-nums text-foreground/[0.08] transition-colors group-hover:text-foreground/[0.14]">
                    {step.stepNumber}
                  </span>
                  <h3 className="font-heading mt-3 text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Why Aphilio */}
          <section
            className="mx-auto mt-16 w-full max-w-5xl sm:mt-20 lg:mt-24"
            aria-labelledby="why-title"
          >
            <div className="mb-8 space-y-2 text-center sm:mb-10">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                {t("whyEyebrow")}
              </p>
              <h2
                id="why-title"
                className="font-heading text-xl font-semibold tracking-tight sm:text-2xl"
              >
                {t("whyTitle")}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              {whyItems.map(({ icon: WhyIcon, title, description }) => (
                <div
                  key={title}
                  className="feature-card-muted group relative overflow-hidden rounded-2xl border p-5 sm:p-6"
                >
                  <div
                    className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent-gradient opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-[0.1]"
                    aria-hidden
                  />
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/80 shadow-sm">
                    <WhyIcon className="size-5 text-foreground/70" aria-hidden />
                  </div>
                  <h3 className="font-heading mt-4 text-base font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section
            id="pricing"
            className="mx-auto mt-16 w-full max-w-5xl scroll-mt-24 sm:mt-20 lg:mt-28"
            aria-labelledby="pricing-title"
          >
            <div className="mb-8 space-y-2 text-center sm:mb-10">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                {t("pricingEyebrow")}
              </p>
              <h2
                id="pricing-title"
                className="font-heading text-xl font-semibold tracking-tight sm:text-2xl"
              >
                {t("pricingTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("pricingSubtitle")}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Monthly */}
              <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm ring-1 ring-foreground/[0.03] backdrop-blur-sm sm:p-7">
                <div
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent-gradient opacity-[0.06] blur-3xl transition-opacity duration-300 group-hover:opacity-[0.1]"
                  aria-hidden
                />
                <div className="relative">
                  <h3 className="font-heading text-lg font-semibold tracking-tight">
                    {t("pricingMonthlyTitle")}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {t("pricingMonthlyTagline")}
                  </p>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="font-heading text-4xl font-bold tracking-tight">
                      {t("pricingProMonthlyPrice")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {t("pricingProPeriod")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground/80">
                    {t("pricingMonthlyBillingNote")}
                  </p>
                </div>

                <ul className="relative mt-6 flex-1 space-y-3">
                  {proFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-foreground/80"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-foreground/70"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="relative mt-8">
                  <Link
                    href="/api/checkout/start?slug=monthly"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "default" }),
                      "w-full rounded-xl font-semibold",
                    )}
                  >
                    {t("pricingMonthlyCta")}
                  </Link>
                </div>
              </div>

              {/* Yearly */}
              <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-foreground/[0.12] bg-card/90 p-6 shadow-lg ring-1 ring-foreground/[0.06] backdrop-blur-sm sm:p-7">
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent-gradient opacity-[0.12] blur-3xl transition-opacity duration-300 group-hover:opacity-[0.18]"
                  aria-hidden
                />

                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-lg font-semibold tracking-tight">
                      {t("pricingYearlyTitle")}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {t("pricingYearlyTagline")}
                    </p>
                  </div>
                  <span className="gradient-pill shrink-0 text-[0.6rem] tracking-[0.13em]">
                    {t("pricingProBadge")}
                  </span>
                </div>

                <div className="relative mt-5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading text-4xl font-bold tracking-tight">
                      {t("pricingProYearlyPrice")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {t("pricingProPeriod")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground/80">
                    {t("pricingYearlyBillingNote")}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-gradient">
                    {t("pricingProSaveLabel")}
                  </p>
                </div>

                <ul className="relative mt-6 flex-1 space-y-3">
                  {proFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-foreground/80"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-foreground/70"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="relative mt-8">
                  <Link
                    href="/api/checkout/start?slug=yearly"
                    className={cn(
                      buttonVariants({ variant: "default", size: "default" }),
                      "w-full rounded-xl font-semibold",
                    )}
                  >
                    {t("pricingYearlyCta")}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* CTA band */}
          <section
            className="mx-auto mt-16 w-full max-w-5xl sm:mt-20 lg:mt-24"
            aria-labelledby="cta-band-title"
          >
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card/90 via-card/70 to-muted/30 p-8 text-center shadow-md ring-1 ring-foreground/[0.04] backdrop-blur-sm sm:p-10 lg:p-12">
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent-gradient opacity-[0.08] blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent-gradient opacity-[0.06] blur-3xl"
                aria-hidden
              />
              <h2
                id="cta-band-title"
                className="relative font-heading text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl"
              >
                {t("ctaBandTitle")}
              </h2>
              <p className="relative mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t("ctaBandDescription")}
              </p>
              <div className="relative mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Link
                  href="/sign-in"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "inline-flex h-12 rounded-xl px-8 text-sm font-semibold shadow-md sm:text-base",
                  )}
                >
                  {t("ctaBandButton")}
                  <ArrowRight className="ml-1.5 size-4" aria-hidden />
                </Link>
                <Link
                  href="#pricing"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "h-12 rounded-xl text-sm text-muted-foreground hover:text-foreground sm:text-base",
                  )}
                >
                  {t("navPricing")}
                </Link>
              </div>
              <p className="relative mt-4 text-xs text-muted-foreground/70">
                {t("trustWorkspace")} · {t("trustBrowser")}
              </p>
            </div>
          </section>

          <footer className="relative mx-auto mt-16 w-full max-w-5xl border-t border-border/60 pt-8 text-center sm:mt-20">
            <p className="text-sm text-muted-foreground">{t("footerTagline")}</p>
            <p className="mt-2 text-xs text-muted-foreground/80">
              {t("footerCopyright", { year })}
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
