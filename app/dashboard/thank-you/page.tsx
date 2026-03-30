import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { BrandLogoLink } from "@/components/brand-logo";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { ThankYouAnalytics } from "./thank-you-analytics";
import { ThankYouConfetti } from "./thank-you-confetti";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("thankYou");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ThankYouPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }

  const t = await getTranslations("thankYou");

  return (
    <main className="landing-grid-bg relative flex h-full min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background text-foreground">
      <ThankYouAnalytics />
      <ThankYouConfetti />

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
      >
        <div className="glow-orb absolute -left-32 top-0 h-96 w-96 bg-accent-gradient opacity-[0.14] sm:h-[28rem] sm:w-[28rem]" />
        <div className="glow-orb absolute -right-24 bottom-10 h-80 w-80 bg-accent-gradient opacity-[0.1] sm:bottom-20" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col items-center text-center">
          <BrandLogoLink priority size="signIn" className="justify-center" />

          <h1 className="font-heading mt-8 text-balance text-2xl font-semibold tracking-tight sm:mt-10 sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("subtitle")}
          </p>

          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-10 min-w-[12rem] rounded-xl font-semibold shadow-sm",
            )}
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </main>
  );
}
