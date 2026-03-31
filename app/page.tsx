import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Globe,
  LayoutGrid,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { BrandLogoLink } from "@/components/brand-logo";
import { CheckoutTrackedLink } from "@/components/analytics/checkout-tracked-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { getSiteOrigin } from "@/lib/site-url";

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

/** Shared landing typography — hierarchy, spacing, readable line length. */
const landingEyebrow =
  "text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/90 sm:text-[0.8125rem] sm:tracking-[0.18em]";
const landingSectionHeading =
  "font-heading text-2xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-3xl sm:leading-[1.12]";
const landingFeatureTitle =
  "font-heading text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl sm:leading-snug";
const landingBody =
  "text-[0.9375rem] leading-[1.65] text-muted-foreground sm:text-base sm:leading-[1.65]";
const landingCardTitle =
  "font-heading text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl";
/** Hero headline rows — same scale so setup + payoff read as one statement. */
const landingHeroHeadlineLine =
  "block w-full text-[1.75rem] font-semibold leading-[1.2] tracking-tight text-foreground sm:text-[2.65rem] sm:leading-[1.14] lg:text-[3.15rem] lg:leading-[1.1]";

/** Intrinsic size of each demo asset (avoids cropping with object-contain). */
const demoImageDimensions: Record<string, { width: number; height: number }> = {
  "/demos/dna-preview-demo.webp": { width: 2777, height: 2028 },
  "/demos/ad-creative-generation-demo.webp": { width: 2118, height: 1783 },
  "/demos/creative-library-demo.webp": { width: 2464, height: 1972 },
  "/demos/chat-demo.webp": { width: 2718, height: 2021 },
};

function LandingDemoImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const pixels = demoImageDimensions[src];
  if (!pixels) {
    throw new Error(`Missing demoImageDimensions for ${src}`);
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={pixels.width}
      height={pixels.height}
      sizes={sizes}
      priority={priority}
      className={cn(
        "h-auto w-full max-w-full object-contain object-top",
        className,
      )}
    />
  );
}

export default async function Home() {
  const siteOrigin = getSiteOrigin();
  const locale = await getLocale();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const structuredData = {
    ...jsonLd,
    url: `${siteOrigin}/`,
    image: `${siteOrigin}/main.jpg`,
  };
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

  const featureDemoBlocks = [
    {
      title: t("featureSourceTitle"),
      description: t("featureSourceDescription"),
      image: {
        src: "/demos/dna-preview-demo.webp",
        alt: t("featureSourceTitle"),
      },
      browserChromeUrl: "https://shipfa.st",
    },
    {
      title: t("featureShipTitle"),
      description: t("featureShipDescription"),
      image: {
        src: "/demos/ad-creative-generation-demo.webp",
        alt: t("featureShipTitle"),
      },
    },
    {
      title: t("featureLibraryTitle"),
      description: t("featureLibraryDescription"),
      image: {
        src: "/demos/creative-library-demo.webp",
        alt: t("featureLibraryTitle"),
      },
    },
    {
      title: t("featureAccountTitle"),
      description: t("featureAccountDescription"),
      image: {
        src: "/demos/chat-demo.webp",
        alt: t("featureAccountTitle"),
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
            <h1 className="font-heading flex w-full max-w-[40rem] flex-col items-center gap-2 text-balance sm:max-w-[44rem] sm:gap-2.5">
              <span className={landingHeroHeadlineLine}>
                <span className="text-foreground">{t("headline1")}</span>{" "}
                <span className="text-gradient">{t("headline2")}</span>
                <span
                  className="inline-block align-[0.08em] pl-1.5 text-[0.72em] leading-none sm:pl-2 sm:text-[0.68em]"
                  aria-hidden={true}
                >
                  {t("headlineEmoji")}
                </span>
              </span>
              <span className={landingHeroHeadlineLine}>{t("headline3")}</span>
            </h1>

            <p className="mx-auto mt-7 max-w-[min(100%,36rem)] text-pretty text-[0.9375rem] leading-[1.65] text-muted-foreground sm:mt-9 sm:max-w-[38rem] sm:text-[1.0625rem] sm:leading-[1.7]">
              {t("subhead")}
            </p>

            <div className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
              <Link
                href="#features"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 rounded-xl border-border/80 bg-background/60 px-8 text-sm font-semibold shadow-sm backdrop-blur-sm sm:min-w-[11rem] sm:text-base",
                )}
              >
                {t("ctaSeeFeatures")}
              </Link>
              <Link
                href="#pricing"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "h-12 rounded-xl px-8 text-sm font-semibold shadow-md sm:min-w-[11rem] sm:text-base",
                )}
              >
                {t("ctaSubscribe")}
                <ArrowRight className="ml-1.5 size-4" aria-hidden />
              </Link>
            </div>
          </div>

          {/* Feature demos */}
          <section
            id="features"
            className="mx-auto mt-16 w-full max-w-6xl scroll-mt-24 sm:mt-20 lg:mt-28"
            aria-labelledby="features-heading"
          >
            <h2 id="features-heading" className="sr-only">
              {t("featuresSectionAria")}
            </h2>

            <div className="flex flex-col gap-14 sm:gap-16 lg:gap-20">
              {featureDemoBlocks.map((block, blockIndex) => (
                <article
                  key={block.title}
                  className={cn(
                    "flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12 xl:gap-16",
                    blockIndex % 2 === 1 && "lg:flex-row-reverse",
                  )}
                >
                  <div className="min-w-0 shrink-0 space-y-4 text-left lg:max-w-[min(100%,22rem)] xl:max-w-[24rem]">
                    <h3 className={landingFeatureTitle}>{block.title}</h3>
                    <p className={cn(landingBody, "max-w-[40ch] text-pretty")}>
                      {block.description}
                    </p>
                  </div>

                  <div className="min-w-0 flex-1">
                    {"browserChromeUrl" in block && block.browserChromeUrl ? (
                      <div className="overflow-hidden rounded-2xl bg-muted/20">
                        <div className="flex items-center gap-3 border-b border-border/40 bg-muted/25 px-3 py-2.5 sm:px-4 sm:py-3">
                          <div className="flex shrink-0 gap-1.5" aria-hidden>
                            <span className="size-2.5 rounded-full bg-red-400/90" />
                            <span className="size-2.5 rounded-full bg-amber-400/90" />
                            <span className="size-2.5 rounded-full bg-emerald-400/90" />
                          </div>
                          <div className="min-w-0 flex-1 truncate rounded-md bg-background/70 px-3 py-2 text-left text-[0.7rem] text-muted-foreground sm:text-xs">
                            {block.browserChromeUrl}
                          </div>
                        </div>
                        <div className="w-full bg-muted/30">
                          <LandingDemoImage
                            src={block.image.src}
                            alt={block.image.alt}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority={blockIndex === 0}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-xl bg-muted/15">
                        <LandingDemoImage
                          src={block.image.src}
                          alt={block.image.alt}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section
            id="how-it-works"
            className="mx-auto mt-16 w-full max-w-5xl scroll-mt-24 sm:mt-20 lg:mt-28"
            aria-labelledby="how-it-works-title"
          >
            <div className="mb-10 space-y-4 text-center sm:mb-12 sm:space-y-5">
              <p className={landingEyebrow}>{t("howEyebrow")}</p>
              <h2 id="how-it-works-title" className={landingSectionHeading}>
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
                  <h3 className={cn(landingCardTitle, "mt-3 text-foreground")}>
                    {step.title}
                  </h3>
                  <p className={cn(landingBody, "mt-3 text-pretty")}>
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
            <div className="mb-10 space-y-4 text-center sm:mb-12 sm:space-y-5">
              <p className={landingEyebrow}>{t("whyEyebrow")}</p>
              <h2 id="why-title" className={landingSectionHeading}>
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
                  <h3 className={cn(landingCardTitle, "mt-4")}>{title}</h3>
                  <p className={cn(landingBody, "mt-3 text-pretty")}>
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
            <div className="mb-10 space-y-4 text-center sm:mb-12 sm:space-y-5">
              <p className={landingEyebrow}>{t("pricingEyebrow")}</p>
              <h2 id="pricing-title" className={landingSectionHeading}>
                {t("pricingTitle")}
              </h2>
              <p
                className={cn(
                  landingBody,
                  "mx-auto max-w-md text-pretty text-muted-foreground/95",
                )}
              >
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
                  <h3 className={landingFeatureTitle}>{t("pricingMonthlyTitle")}</h3>
                  <p className={cn(landingBody, "mt-2")}>
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
                      className="flex items-start gap-2.5 text-[0.9375rem] leading-[1.55] text-foreground/85 sm:text-base sm:leading-[1.55]"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-foreground/65"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="relative mt-8">
                  <CheckoutTrackedLink
                    planSlug="monthly"
                    href="/api/checkout/start?slug=monthly"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "default" }),
                      "w-full rounded-xl font-semibold",
                    )}
                  >
                    {t("pricingMonthlyCta")}
                  </CheckoutTrackedLink>
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
                    <h3 className={landingFeatureTitle}>{t("pricingYearlyTitle")}</h3>
                    <p className={cn(landingBody, "mt-2")}>
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
                      className="flex items-start gap-2.5 text-[0.9375rem] leading-[1.55] text-foreground/85 sm:text-base sm:leading-[1.55]"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-foreground/65"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="relative mt-8">
                  <CheckoutTrackedLink
                    planSlug="yearly"
                    href="/api/checkout/start?slug=yearly"
                    className={cn(
                      buttonVariants({ variant: "default", size: "default" }),
                      "w-full rounded-xl font-semibold",
                    )}
                  >
                    {t("pricingYearlyCta")}
                  </CheckoutTrackedLink>
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
                className="relative font-heading text-2xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-3xl sm:leading-[1.12] lg:text-[2rem] lg:leading-tight"
              >
                {t("ctaBandTitle")}
              </h2>
              <p className="relative mx-auto mt-4 max-w-[46ch] text-base leading-[1.65] text-muted-foreground/95 sm:mt-5 sm:text-[1.0625rem] sm:leading-[1.65]">
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
              <p className="relative mt-5 text-sm text-muted-foreground/75">
                {t("trustWorkspace")} · {t("trustBrowser")}
              </p>
            </div>
          </section>

          <footer className="relative mx-auto mt-16 w-full max-w-5xl border-t border-border/60 pt-10 text-center sm:mt-20">
            <p className="text-sm leading-relaxed text-muted-foreground/90">
              {t("footerTagline")}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground/75">
              {t("footerCopyright", { year })}
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
