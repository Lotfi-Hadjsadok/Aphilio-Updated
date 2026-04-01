import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Dna, Wand2, MessageSquare } from "lucide-react";
import { SignInGoogleButton } from "@/app/sign-in/sign-in-google-button";
import { BrandLogoLink } from "@/components/brand-logo";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("signInTitle"),
    description: t("signInDescription"),
    alternates: {
      canonical: "/sign-in",
    },
  };
}

export default async function SignInPage() {
  const locale = await getLocale();
  const t = await getTranslations("signIn");

  const benefits = [
    { icon: Dna, text: t("benefit1") },
    { icon: Wand2, text: t("benefit2") },
    { icon: MessageSquare, text: t("benefit3") },
  ] as const;

  return (
    <div className="landing-grid-bg relative flex min-h-[100dvh] flex-col bg-background">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute left-[12%] top-[18%] h-72 w-72 bg-accent-gradient opacity-[0.12] sm:left-1/4 sm:top-1/4 sm:h-80 sm:w-80 sm:opacity-[0.16]" />
        <div className="glow-orb absolute bottom-[12%] right-[10%] h-64 w-64 bg-accent-gradient opacity-[0.1] sm:right-1/4 sm:bottom-1/4 sm:opacity-[0.14]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-8 sm:py-6">
        <div className="flex w-full min-w-0 items-center justify-between gap-3 sm:contents">
          <BrandLogoLink priority size="header" className="shrink-0" />
          <div className="flex min-h-0 min-w-0 shrink-0 items-center justify-end sm:mx-4 sm:flex-1 sm:justify-end">
            <LanguageSwitcher currentLocale={locale} className="max-w-[11rem] sm:max-w-[13rem]" />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-12 pt-4 sm:px-8 sm:pb-16 sm:pt-6">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
          <div className="gradient-border-2 w-full shadow-lg shadow-black/5 dark:shadow-black/25">
            <div className="gradient-border-2-bg flex flex-col items-center gap-5 rounded-[calc(var(--radius)-1px)] px-6 py-8 sm:px-8 sm:py-9">
              <BrandLogoLink priority size="signIn" className="justify-center" />

              {/* Heading block */}
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-lg font-semibold tracking-tight text-foreground">
                  {t("welcomeBack")}
                </p>
                <p className="max-w-[30ch] text-pretty text-sm leading-relaxed text-muted-foreground">
                  {t("tagline")}
                </p>
              </div>

              <div className="h-px w-full bg-border/60" />

              {/* Sign-in block */}
              <div className="flex w-full flex-col items-center gap-4">
                <SignInGoogleButton label={t("googleSignIn")} />
                <p className="text-center text-[0.65rem] leading-snug text-muted-foreground sm:text-xs">
                  {t("termsNotice")}
                </p>
              </div>

            </div>
          </div>

          {/* Feature reminders */}
          <ul className="flex flex-col gap-2.5 px-1" aria-label={t("benefitsAria")}>
            {benefits.map(({ icon: BenefitIcon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card/80">
                  <BenefitIcon className="size-3.5 text-foreground/60" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
