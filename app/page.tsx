import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
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
import { HeroConvertHighlight } from "@/components/landing/hero-convert-highlight";
import { DnaPreviewFlipChips, type DnaChipFaceData } from "@/components/landing/dna-preview-flip-chips";
import { LandingDemoImage } from "@/components/landing/landing-demo-image";
import { PricingPlansSection } from "@/components/landing/pricing-plans-section";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { getSiteOrigin } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Aphilio: Turn Websites Into Ads That Convert",
    description:
      "We scan your site and generate high-converting, on-brand creatives in seconds.",
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

const landingEyebrow =
  "text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/90 sm:text-[1.125rem] sm:tracking-[0.16em]";
const landingSectionHeading =
  "font-heading text-3xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl sm:leading-[1.08] lg:text-6xl lg:leading-[1.06] xl:text-7xl xl:leading-[1.04]";
const landingFeatureTitle =
  "font-heading text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-snug xl:text-6xl xl:leading-snug";
const landingBody =
  "text-base leading-[1.65] text-muted-foreground sm:text-[1.25rem] sm:leading-[1.65] lg:text-[1.3125rem]";
const landingCardTitle =
  "font-heading text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl";
const landingHeroHeadlineLine =
  "block w-full text-[2.75rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-[5.5rem] sm:leading-[1.06] lg:text-[7rem] lg:leading-[1.03]";

const stepAccents = [
  {
    borderClass: "border-orange-500/30",
    bgClass: "bg-orange-500/[0.06]",
    numberClass: "text-orange-500",
    glowClass: "bg-orange-500",
  },
  {
    borderClass: "border-purple-500/30",
    bgClass: "bg-purple-500/[0.06]",
    numberClass: "text-purple-500",
    glowClass: "bg-purple-500",
  },
  {
    borderClass: "border-blue-500/30",
    bgClass: "bg-blue-500/[0.06]",
    numberClass: "text-blue-500",
    glowClass: "bg-blue-500",
  },
];

const whyIconStyles = [
  { iconBg: "bg-blue-500/10 border-blue-500/20", iconColor: "text-blue-500" },
  { iconBg: "bg-purple-500/10 border-purple-500/20", iconColor: "text-purple-500" },
  { iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-500" },
  { iconBg: "bg-orange-500/10 border-orange-500/20", iconColor: "text-orange-500" },
];

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

  const heroStats = [
    { value: t("heroStat1Value"), label: t("heroStat1Label") },
    { value: t("heroStat2Value"), label: t("heroStat2Label") },
    { value: t("heroStat3Value"), label: t("heroStat3Label") },
  ];

  const featureAccents = [
    {
      badge: t("featureBadgeExtract"),
      badgeClass: "text-orange-500 bg-orange-500/10 border border-orange-500/25",
      glowClass: "from-orange-500/[0.07]",
    },
    {
      badge: t("featureBadgeGenerate"),
      badgeClass: "text-purple-500 bg-purple-500/10 border border-purple-500/25",
      glowClass: "from-purple-500/[0.07]",
    },
    {
      badge: t("featureBadgeOrganize"),
      badgeClass: "text-blue-500 bg-blue-500/10 border border-blue-500/25",
      glowClass: "from-blue-500/[0.07]",
    },
    {
      badge: t("featureBadgeChat"),
      badgeClass: "text-pink-500 bg-pink-500/10 border border-pink-500/25",
      glowClass: "from-pink-500/[0.07]",
    },
  ];

  const dnaChipsFrontData: DnaChipFaceData[] = [
    {
      label: t("featureBadgeExtract"),
      borderClass: "border-orange-500/25",
      bgClass: "bg-orange-500/[0.07]",
      labelColor: "text-orange-400",
      delay: "0s",
      duration: "4.2s",
      rotate: "-2deg",
      content: {
        kind: "text",
        text: t("featureSourceTitle"),
        textClassName: "mt-1 text-[0.875rem] font-semibold leading-[1.2] text-foreground/70 sm:text-[0.95rem]",
      },
    },
    {
      label: t("featureBadgeGenerate"),
      borderClass: "border-purple-500/25",
      bgClass: "bg-purple-500/[0.07]",
      labelColor: "text-purple-400",
      delay: "0.6s",
      duration: "3.8s",
      rotate: "1.5deg",
      content: {
        kind: "text",
        text: t("featureShipTitle"),
        textClassName: "mt-1 text-[0.875rem] font-semibold leading-[1.2] text-foreground/70 sm:text-[0.95rem]",
      },
    },
    {
      label: t("featureBadgeOrganize"),
      borderClass: "border-blue-500/25",
      bgClass: "bg-blue-500/[0.07]",
      labelColor: "text-blue-400",
      delay: "1.1s",
      duration: "4.6s",
      rotate: "-1.2deg",
      content: {
        kind: "text",
        text: t("featureLibraryTitle"),
        textClassName: "mt-1 text-[0.875rem] font-semibold leading-[1.2] text-foreground/70 sm:text-[0.95rem]",
      },
    },
    {
      label: t("featureBadgeChat"),
      borderClass: "border-pink-500/25",
      bgClass: "bg-pink-500/[0.07]",
      labelColor: "text-pink-400",
      delay: "1.6s",
      duration: "4s",
      rotate: "2deg",
      content: {
        kind: "text",
        text: t("featureAccountTitle"),
        textClassName: "mt-1 text-[0.875rem] font-semibold leading-[1.2] text-foreground/70 sm:text-[0.95rem]",
      },
    },
  ];

  const dnaChipsBackData: DnaChipFaceData[] = [
    {
      label: t("chipBrandColors"),
      borderClass: "border-orange-500/25",
      bgClass: "bg-orange-500/[0.07]",
      labelColor: "text-orange-400",
      delay: "0s",
      duration: "4.2s",
      rotate: "-2deg",
      content: {
        kind: "colors",
        colors: ["#f97316", "#f59e0b", "#a855f7", "#3b82f6"],
      },
    },
    {
      label: t("chipTypography"),
      borderClass: "border-purple-500/25",
      bgClass: "bg-purple-500/[0.07]",
      labelColor: "text-purple-400",
      delay: "0.6s",
      duration: "3.8s",
      rotate: "1.5deg",
      content: {
        kind: "pills",
        items: ["1:1", "4:5", "9:16", "16:9"],
      },
    },
    {
      label: t("chipBrandVoice"),
      borderClass: "border-blue-500/25",
      bgClass: "bg-blue-500/[0.07]",
      labelColor: "text-blue-400",
      delay: "1.1s",
      duration: "4.6s",
      rotate: "-1.2deg",
      content: {
        kind: "pills",
        items: ["Bold", "Clear", "Human"],
      },
    },
    {
      label: t("chipAdAngles"),
      borderClass: "border-pink-500/25",
      bgClass: "bg-pink-500/[0.07]",
      labelColor: "text-pink-400",
      delay: "1.6s",
      duration: "4s",
      rotate: "2deg",
      content: {
        kind: "pills",
        items: ["Pain", "Proof", "Urgency"],
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
        {/* Background glow orbs — more vivid than before */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="glow-orb absolute -left-32 -top-16 h-[36rem] w-[36rem] bg-accent-gradient opacity-[0.22] sm:opacity-[0.28] animate-pulse-glow" />
          <div className="glow-orb absolute -right-24 top-1/4 h-96 w-96 bg-accent-gradient opacity-[0.18] sm:opacity-[0.22]" style={{ animationDelay: "1.2s" }} />
          <div className="glow-orb absolute bottom-10 left-1/2 h-80 w-80 -translate-x-1/2 bg-accent-gradient opacity-[0.12] sm:opacity-[0.18]" style={{ animationDelay: "2.4s" }} />
          <div className="glow-orb absolute right-1/4 top-2/3 h-56 w-56 bg-accent-gradient opacity-[0.1] sm:opacity-[0.14]" style={{ animationDelay: "0.8s" }} />
        </div>

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-base focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {t("skipToContent")}
        </a>

        {/* Header */}
        <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-5 sm:px-10 sm:py-8">
          <div className="flex w-full min-w-0 items-center justify-between gap-3 sm:contents">
            <BrandLogoLink priority size="landing" className="shrink-0" />
            <div className="flex min-h-0 min-w-0 shrink-0 items-center justify-end gap-4 sm:min-w-0 sm:flex-1 sm:justify-center sm:mx-4 sm:gap-7">
              <LanguageSwitcher currentLocale={locale} variant="prominent" />
              <Link
                href="/plans"
                className="hidden text-lg font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                {t("navPricing")}
              </Link>
            </div>
          </div>
          {session ? (
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "hidden h-10 w-fit shrink-0 self-center gap-1.5 rounded-lg px-4 text-base font-medium shadow-sm backdrop-blur-sm sm:inline-flex sm:h-11 sm:gap-2 sm:rounded-xl sm:px-6 sm:text-lg",
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
                "hidden h-10 w-fit shrink-0 self-center gap-1.5 rounded-lg px-4 text-base font-medium shadow-sm backdrop-blur-sm sm:inline-flex sm:h-11 sm:gap-2 sm:rounded-xl sm:px-6 sm:text-lg",
              )}
            >
              {tCommon("signIn")}
              <ArrowRight className="size-3.5 opacity-60 sm:size-4" aria-hidden />
            </Link>
          )}
        </header>

        <main
          id="main-content"
          className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pb-24 pt-7 sm:px-10 sm:pb-32 sm:pt-14 lg:pb-36 lg:pt-22"
        >
          {/* ─── HERO ─────────────────────────────────────────────────────── */}
          <div className="flex flex-col items-center justify-center text-center">
            {/* Headline */}
            <h1 className="font-heading flex w-full max-w-[56rem] flex-col items-center gap-2 text-balance sm:max-w-[64rem] sm:gap-2.5">
              <span className={landingHeroHeadlineLine}>
                {t("headline1")}
              </span>
              <span className={landingHeroHeadlineLine}>
                {t.rich("headline2", {
                  highlight: (chunks) => (
                    <HeroConvertHighlight>{chunks}</HeroConvertHighlight>
                  ),
                })}
              </span>
            </h1>

            {/* Subhead */}
            <p className="mx-auto mt-10 max-w-[min(100%,46rem)] text-pretty text-[1.0625rem] leading-[1.65] text-muted-foreground sm:mt-12 sm:max-w-[48rem] sm:text-[1.5rem] sm:leading-[1.65]">
              {t("subhead")}
            </p>

            {/* CTA buttons */}
            <div className="mt-12 flex w-full max-w-md flex-col items-stretch gap-4 sm:mt-14 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-6">
              <Link
                href="#features"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "min-h-11 rounded-2xl border-border/80 bg-background/60 px-6 py-2.5 text-base font-semibold shadow-sm backdrop-blur-sm sm:min-h-16 sm:min-w-[14rem] sm:rounded-3xl sm:px-10 sm:py-4 sm:text-2xl",
                )}
              >
                {t("ctaSeeFeatures")}
              </Link>
              <Link
                href="/plans"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "min-h-11 rounded-2xl px-6 py-2.5 text-base font-semibold shadow-lg sm:min-h-16 sm:min-w-[14rem] sm:rounded-3xl sm:px-10 sm:py-4 sm:text-2xl",
                )}
              >
                {t("ctaViewPlans")}
                <ArrowRight className="ml-1.5 size-4 sm:ml-2.5 sm:size-6" aria-hidden />
              </Link>
            </div>

            {/* Stats strip */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-8 sm:mt-16 sm:gap-14">
              {heroStats.map(({ value, label }, statIndex) => (
                <div key={`${value}-${label}`} className="text-center">
                  <div
                    className={cn(
                      "font-heading font-bold text-gradient",
                      statIndex === 2
                        ? "text-5xl leading-none tracking-tight sm:text-7xl"
                        : "text-4xl sm:text-6xl",
                    )}
                  >
                    {value}
                  </div>
                  <div className="mt-1 text-base text-muted-foreground/80 sm:text-xl">{label}</div>
                </div>
              ))}
            </div>

            {/* DNA Preview Chips */}
            <DnaPreviewFlipChips chipsFront={dnaChipsFrontData} chipsBack={dnaChipsBackData} />
          </div>

          {/* ─── FEATURE DEMOS ──────────────────────────────────────────────── */}
          <section
            id="features"
            className="mx-auto mt-28 w-full max-w-7xl scroll-mt-24 sm:mt-36 lg:mt-44"
            aria-labelledby="features-heading"
          >
            <div className="mb-16 space-y-6 text-center sm:mb-20">
              <p className={landingEyebrow}>{t("featuresEyebrow")}</p>
              <h2 id="features-heading" className={landingSectionHeading}>
                {t("featuresHeading")}
              </h2>
            </div>

            <div className="flex flex-col gap-24 sm:gap-28 lg:gap-36">
              {featureDemoBlocks.map((block, blockIndex) => {
                const accent = featureAccents[blockIndex];
                return (
                  <article
                    key={block.title}
                    className={cn(
                      "flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16 xl:gap-20",
                      blockIndex % 2 === 1 && "lg:flex-row-reverse",
                    )}
                  >
                    <div className="min-w-0 shrink-0 space-y-6 text-left lg:max-w-[min(100%,26rem)] xl:max-w-[28rem]">
                      {/* Feature badge */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.75rem] font-bold uppercase tracking-[0.14em] sm:px-4 sm:py-1.5 sm:text-[0.9375rem]",
                          accent.badgeClass,
                        )}
                      >
                        <Zap className="size-3.5 sm:size-4" aria-hidden />
                        {accent.badge}
                      </span>
                      <h3 className={landingFeatureTitle}>{block.title}</h3>
                      <p className={cn(landingBody, "max-w-[40ch] text-pretty")}>
                        {block.description}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      {"browserChromeUrl" in block && block.browserChromeUrl ? (
                        <div className="overflow-hidden rounded-3xl border border-border/60 bg-muted/20 shadow-2xl ring-1 ring-foreground/[0.04]">
                          <div className="flex items-center gap-3 border-b border-border/40 bg-muted/25 px-4 py-3 sm:px-5 sm:py-3.5">
                            <div className="flex shrink-0 gap-2" aria-hidden>
                              <span className="size-3 rounded-full bg-red-400/90" />
                              <span className="size-3 rounded-full bg-amber-400/90" />
                              <span className="size-3 rounded-full bg-emerald-400/90" />
                            </div>
                            <div className="min-w-0 flex-1 truncate rounded-md bg-background/70 px-3 py-2 text-left text-sm text-muted-foreground sm:py-2.5 sm:text-lg">
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
                        <div className="overflow-hidden rounded-3xl border border-border/50 bg-muted/15 shadow-2xl ring-1 ring-foreground/[0.03]">
                          <LandingDemoImage
                            src={block.image.src}
                            alt={block.image.alt}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* ─── HOW IT WORKS ────────────────────────────────────────────────── */}
          <section
            id="how-it-works"
            className="mx-auto mt-28 w-full max-w-6xl scroll-mt-24 sm:mt-36 lg:mt-44"
            aria-labelledby="how-it-works-title"
          >
            <div className="mb-16 space-y-6 text-center sm:mb-20">
              <p className={landingEyebrow}>{t("howEyebrow")}</p>
              <h2 id="how-it-works-title" className={landingSectionHeading}>
                {t("howTitle")}
              </h2>
            </div>

            <div className="grid gap-7 sm:grid-cols-3 sm:gap-8">
              {steps.map((step, stepIndex) => {
                const accent = stepAccents[stepIndex];
                return (
                  <div
                    key={step.stepNumber}
                    className={cn(
                      "group relative overflow-hidden rounded-3xl border p-6 text-left shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-9",
                      accent.borderClass,
                      accent.bgClass,
                    )}
                  >
                    <div
                      className={cn(
                        "pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-[0.18]",
                        accent.glowClass,
                      )}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "font-heading text-7xl font-bold tabular-nums transition-opacity duration-200 sm:text-8xl lg:text-9xl",
                        accent.numberClass,
                        "opacity-40 group-hover:opacity-70",
                      )}
                    >
                      {step.stepNumber}
                    </span>
                    <h3 className={cn(landingCardTitle, "mt-4 text-foreground")}>
                      {step.title}
                    </h3>
                    <p className={cn(landingBody, "mt-4 text-pretty")}>
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ─── WHY APHILIO ─────────────────────────────────────────────────── */}
          <section
            className="mx-auto mt-28 w-full max-w-6xl sm:mt-36 lg:mt-40"
            aria-labelledby="why-title"
          >
            <div className="mb-16 space-y-6 text-center sm:mb-20">
              <p className={landingEyebrow}>{t("whyEyebrow")}</p>
              <h2 id="why-title" className={landingSectionHeading}>
                {t("whyTitle")}
              </h2>
            </div>

            <div className="grid gap-7 sm:grid-cols-2 sm:gap-8">
              {whyItems.map(({ icon: WhyIcon, title, description }, whyIndex) => {
                const iconStyle = whyIconStyles[whyIndex];
                return (
                  <div
                    key={title}
                    className={cn(
                      "group relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm ring-1 ring-foreground/[0.03] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-9",
                    )}
                  >
                    <div
                      className={cn(
                        "pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent-gradient opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-[0.1]",
                      )}
                      aria-hidden
                    />
                    <div
                      className={cn(
                        "flex size-14 items-center justify-center rounded-2xl border shadow-sm sm:size-16",
                        iconStyle.iconBg,
                      )}
                    >
                      <WhyIcon
                        className={cn("size-7 sm:size-8", iconStyle.iconColor)}
                        aria-hidden
                      />
                    </div>
                    <h3 className={cn(landingCardTitle, "mt-6")}>{title}</h3>
                    <p className={cn(landingBody, "mt-4 text-pretty")}>
                      {description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <PricingPlansSection className="mt-28 sm:mt-36 lg:mt-44" />

          {/* ─── CTA BAND ─────────────────────────────────────────────────────── */}
          <section
            className="mx-auto mt-28 w-full max-w-6xl sm:mt-36 lg:mt-40"
            aria-labelledby="cta-band-title"
          >
            <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-card/80 to-muted/40 p-8 text-center shadow-2xl ring-1 ring-foreground/[0.04] backdrop-blur-sm sm:p-16 lg:p-20">
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-gradient opacity-[0.1] blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent-gradient opacity-[0.08] blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full bg-accent-gradient opacity-[0.06] blur-3xl"
                aria-hidden
              />

              <div className="relative mb-6 sm:mb-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 shadow-sm backdrop-blur-sm sm:gap-2.5 sm:px-5 sm:py-2">
                  <span className="size-2 rounded-full bg-accent-gradient animate-pulse-glow sm:size-2.5" aria-hidden />
                  <span className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-lg sm:tracking-[0.14em]">
                    {t("ctaBandEyebrow")}
                  </span>
                </span>
              </div>

              <h2
                id="cta-band-title"
                className="relative font-heading text-3xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl sm:leading-[1.08] lg:text-6xl lg:leading-[1.06] xl:text-[4.25rem] xl:leading-tight"
              >
                {t("ctaBandTitle")}
              </h2>
              <p className="relative mx-auto mt-5 max-w-[50ch] text-lg leading-[1.6] text-muted-foreground/95 sm:mt-8 sm:text-2xl lg:text-3xl sm:leading-[1.55]">
                {t("ctaBandDescription")}
              </p>
              <div className="relative mt-8 flex flex-col items-center gap-4 sm:mt-10 sm:flex-row sm:justify-center sm:gap-6">
                <Link
                  href="/sign-in"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "inline-flex min-h-11 rounded-2xl px-7 py-2.5 text-base font-semibold shadow-lg sm:min-h-16 sm:rounded-3xl sm:px-12 sm:py-4 sm:text-2xl",
                  )}
                >
                  {tCommon("signIn")}
                  <ArrowRight className="ml-1.5 size-4 sm:ml-2.5 sm:size-6" aria-hidden />
                </Link>
                <Link
                  href="/plans"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "min-h-11 rounded-2xl px-4 text-base text-muted-foreground hover:text-foreground sm:min-h-16 sm:rounded-3xl sm:px-6 sm:text-2xl",
                  )}
                >
                  {t("navPricing")}
                </Link>
              </div>
              <p className="relative mt-6 text-lg text-muted-foreground/65 sm:mt-8 sm:text-xl">
                {t("trustWorkspace")}
              </p>
            </div>
          </section>

          <footer className="relative mx-auto mt-24 w-full max-w-6xl border-t border-border/60 pt-12 text-center sm:mt-28">
            <p className="text-lg leading-relaxed text-muted-foreground/90 sm:text-xl lg:text-2xl">
              {t("footerTagline")}
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground/65 sm:text-lg">
              {t("footerCopyright", { year })}
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
