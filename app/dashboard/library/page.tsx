import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Images, Loader2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { DashboardBackPill } from "@/components/dashboard-back-link";
import { auth } from "@/lib/auth";
import { BrandLogoLink } from "@/components/brand-logo";
import { LogoutButton } from "@/components/logout-button";
import { getLibraryCreatives } from "@/app/actions/library";
import { requireActiveSubscriptionOrCheckout } from "@/lib/polar/subscription";
import { LibraryGrid } from "./library-grid";

async function LibraryContent() {
  const { creatives, total } = await getLibraryCreatives(1);
  return <LibraryGrid initialCreatives={creatives} initialTotal={total} />;
}

export default async function LibraryPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  await requireActiveSubscriptionOrCheckout({ userId: session.user.id });

  const t = await getTranslations("library");
  const tCommon = await getTranslations("common");

  return (
    <main className="landing-grid-bg relative flex h-full min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background text-foreground">
      {/* Decorative glow orbs — same as onboarding */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute -left-32 top-0 h-96 w-96 bg-accent-gradient opacity-[0.18] sm:h-[28rem] sm:w-[28rem]" />
        <div className="glow-orb absolute -right-24 bottom-10 h-72 w-72 bg-accent-gradient opacity-[0.14] sm:bottom-20" />
        <div className="glow-orb absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 bg-accent-gradient opacity-[0.06]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
        {/* Top bar: logo + back */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BrandLogoLink />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <DashboardBackPill label={tCommon("dashboard")} />
            <LogoutButton />
          </div>
        </div>

        {/* Header */}
        <header className="mt-6 sm:mt-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient-subtle shadow-lg ring-1 ring-border/60">
              <Images className="h-6 w-6 text-foreground" strokeWidth={1.65} />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                {t("title")}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </header>

        {/* Divider */}
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-border/70 to-transparent sm:my-8" />

        {/* Library grid */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-24">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <LibraryContent />
        </Suspense>
      </div>
    </main>
  );
}
