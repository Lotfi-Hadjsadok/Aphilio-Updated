import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CheckoutTrackedLink } from "@/components/analytics/checkout-tracked-link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const landingEyebrow =
  "text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/90 sm:text-sm sm:tracking-[0.16em]";
const landingSectionHeading =
  "font-heading text-2xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-4xl sm:leading-[1.08] lg:text-5xl lg:leading-[1.06] xl:text-6xl xl:leading-[1.04]";
const landingFeatureTitle =
  "font-heading text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl sm:leading-snug lg:text-4xl lg:leading-snug xl:text-5xl xl:leading-snug";
const landingBody =
  "text-sm leading-[1.65] text-muted-foreground sm:text-base sm:leading-[1.65] lg:text-lg";

type PricingPlansSectionProps = {
  id?: string;
  className?: string;
  /** When false, only the plan cards render (use when the page provides its own title). */
  showSectionHeader?: boolean;
};

export async function PricingPlansSection({
  id = "pricing",
  className,
  showSectionHeader = true,
}: PricingPlansSectionProps) {
  const t = await getTranslations("landing");
  const proFeatures = [
    t("pricingProF1"),
    t("pricingProF2"),
    t("pricingProF3"),
    t("pricingProF4"),
    t("pricingProF5"),
    t("pricingProF6"),
  ];

  return (
    <section
      id={id}
      className={cn("mx-auto w-full max-w-6xl scroll-mt-24", className)}
      aria-labelledby="pricing-title"
    >
      {showSectionHeader ? (
        <div className="mb-16 space-y-6 text-center sm:mb-20">
          <p className={landingEyebrow}>{t("pricingEyebrow")}</p>
          <h2 id="pricing-title" className={landingSectionHeading}>
            {t("pricingTitle")}
          </h2>
          <p
            className={cn(
              landingBody,
              "mx-auto max-w-xl text-pretty text-muted-foreground/95",
            )}
          >
            {t("pricingSubtitle")}
          </p>
        </div>
      ) : (
        <h2 id="pricing-title" className="sr-only">
          {t("pricingTitle")}
        </h2>
      )}

      <div className="grid gap-8 sm:grid-cols-2 sm:gap-9">
        <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm ring-1 ring-foreground/[0.03] backdrop-blur-sm sm:p-10">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-gradient opacity-[0.06] blur-3xl transition-opacity duration-300 group-hover:opacity-[0.11]"
            aria-hidden
          />
          <div className="relative">
            <h3 className={landingFeatureTitle}>{t("pricingMonthlyTitle")}</h3>
            <p className={cn(landingBody, "mt-2.5")}>
              {t("pricingMonthlyTagline")}
            </p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-heading text-4xl font-bold tracking-tight sm:text-6xl">
                {t("pricingProMonthlyPrice")}
              </span>
              <span className="text-sm text-muted-foreground sm:text-base">
                {t("pricingProPeriod")}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground/80 sm:text-sm">
              {t("pricingMonthlyBillingNote")}
            </p>
          </div>

          <ul className="relative mt-8 flex-1 space-y-4">
            {proFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm leading-[1.55] text-foreground/85 sm:text-base sm:leading-[1.55]"
              >
                <Check
                  className="mt-0.5 size-4 shrink-0 text-foreground/55 sm:size-5"
                  aria-hidden
                />
                {feature}
              </li>
            ))}
          </ul>

          <div className="relative mt-9">
            <CheckoutTrackedLink
              planSlug="monthly"
              href="/api/checkout/start?slug=monthly"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "w-full rounded-xl py-3.5 text-sm font-semibold sm:rounded-2xl sm:py-5 sm:text-lg",
              )}
            >
              {t("pricingMonthlyCta")}
            </CheckoutTrackedLink>
          </div>
        </div>

        <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-foreground/[0.12] bg-card/90 p-6 shadow-xl ring-1 ring-foreground/[0.06] backdrop-blur-sm sm:p-10">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-gradient opacity-[0.15] blur-3xl transition-opacity duration-300 group-hover:opacity-[0.22]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-accent-gradient opacity-[0.08] blur-3xl"
            aria-hidden
          />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <h3 className={landingFeatureTitle}>{t("pricingYearlyTitle")}</h3>
              <p className={cn(landingBody, "mt-2.5")}>
                {t("pricingYearlyTagline")}
              </p>
            </div>
            <span className="gradient-pill shrink-0 text-[0.6rem] tracking-[0.12em] sm:text-[0.75rem]">
              {t("pricingProBadge")}
            </span>
          </div>

          <div className="relative mt-6">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-4xl font-bold tracking-tight sm:text-6xl">
                {t("pricingProYearlyPrice")}
              </span>
              <span className="text-sm text-muted-foreground sm:text-base">
                {t("pricingProPeriod")}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground/80 sm:text-sm">
              {t("pricingYearlyBillingNote")}
            </p>
            <p className="mt-2.5 text-sm font-bold text-gradient sm:text-base">
              {t("pricingProSaveLabel")}
            </p>
          </div>

          <ul className="relative mt-8 flex-1 space-y-4">
            {proFeatures.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm leading-[1.55] text-foreground/85 sm:text-base sm:leading-[1.55]"
              >
                <Check
                  className="mt-0.5 size-4 shrink-0 text-foreground/55 sm:size-5"
                  aria-hidden
                />
                {feature}
              </li>
            ))}
          </ul>

          <div className="relative mt-9">
            <CheckoutTrackedLink
              planSlug="yearly"
              href="/api/checkout/start?slug=yearly"
              className={cn(
                buttonVariants({ variant: "default", size: "default" }),
                "w-full rounded-xl py-3.5 text-sm font-semibold sm:rounded-2xl sm:py-5 sm:text-lg",
              )}
            >
              {t("pricingYearlyCta")}
            </CheckoutTrackedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
