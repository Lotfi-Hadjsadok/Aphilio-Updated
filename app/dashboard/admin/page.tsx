import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { BrandLogoLink } from "@/components/brand-logo";
import { dashboardNavPillLinkClassName } from "@/components/dashboard/dashboard-nav-link-classes";
import { Badge } from "@/components/ui/badge";
import { getServerSession, isPlatformAdmin } from "@/lib/server-auth";
import { cn } from "@/lib/utils";
import { listAdminUsersWithCredits } from "@/lib/admin/list-admin-users";
import prisma from "@/lib/prisma";

import { AdminUsersPanel } from "./admin-users-panel";

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

type AdminPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AdminDashboardPage({ searchParams }: AdminPageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (!isPlatformAdmin(session)) {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });

  if (!user?.onboardingCompleted) {
    redirect("/dashboard/onboarding");
  }

  const t = await getTranslations("admin");
  const resolvedSearch = await searchParams;
  const emailQuery = resolvedSearch.q ?? "";
  const { users: adminUsers, total: adminUserTotal } =
    await listAdminUsersWithCredits({ emailSearch: emailQuery });

  return (
    <main className="landing-grid-bg relative flex h-full min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute -left-32 top-0 h-96 w-96 bg-accent-gradient opacity-[0.14] sm:h-[28rem] sm:w-[28rem]" />
        <div className="glow-orb absolute -right-24 bottom-10 h-80 w-80 bg-accent-gradient opacity-[0.1] sm:bottom-20" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
      </div>

      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-8 sm:pt-5">
        <header className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
          <BrandLogoLink className="min-w-0 max-w-full shrink-0 self-start sm:self-auto" />
          <Link
            href="/dashboard"
            className={cn(dashboardNavPillLinkClassName, "w-fit self-start sm:self-auto")}
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            {t("backToDashboard")}
          </Link>
        </header>

        <section className="mt-4 w-full min-w-0 sm:mt-5">
          <div className="flex min-w-0 gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-card/80 ring-1 ring-foreground/5">
              <Shield className="size-4 text-muted-foreground" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs font-normal">
                  {t("pageTitle")}
                </Badge>
                <h1 className="font-semibold text-lg tracking-tight sm:text-xl">
                  {t("heading")}
                </h1>
              </div>
              <p className="max-w-2xl text-muted-foreground text-xs leading-snug sm:text-[13px]">
                {t("subheading")}
              </p>
            </div>
          </div>

          <AdminUsersPanel
            currentUserId={session.user.id}
            initialUsers={adminUsers}
            initialTotal={adminUserTotal}
            emailQuery={emailQuery}
          />
        </section>
      </div>
    </main>
  );
}
