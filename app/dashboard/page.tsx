import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Dna,
  Images,
  LayoutTemplate,
  MessageSquare,
} from "lucide-react";
import { BrandLogoLink } from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";

const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

type ToolCardProps = {
  href: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: React.ReactNode;
  accent?: string;
};

function ToolCard({
  href,
  title,
  description,
  actionLabel,
  icon,
  accent,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className={cn("group block h-full", focusRingClass)}
    >
      <div className="dashboard-tool-card flex h-full flex-col">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent-gradient opacity-[0.08] blur-3xl transition-opacity duration-500 group-hover:opacity-[0.28]"
          aria-hidden
        />
        <div className="relative flex h-full flex-col gap-4 p-5 sm:p-6">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner ring-1 ring-border/80",
              accent ?? "bg-accent-gradient-subtle",
            )}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {title}
            </p>
            <p className="text-[0.8rem] leading-relaxed text-muted-foreground sm:text-sm">
              {description}
            </p>
          </div>
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-gradient">
            {actionLabel}
            <ArrowRight
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </p>
        </div>
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });

  if (!user?.onboardingCompleted) {
    redirect("/dashboard/onboarding");
  }

  const displayName = session.user.name ?? session.user.email;

  return (
    <main className="landing-grid-bg relative flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background text-foreground">
      {/* Decorative glow orbs — same style as onboarding */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute -left-32 top-0 h-96 w-96 bg-accent-gradient opacity-[0.18] sm:h-[28rem] sm:w-[28rem]" />
        <div className="glow-orb absolute -right-24 bottom-10 h-80 w-80 bg-accent-gradient opacity-[0.14] sm:bottom-20" />
        <div className="glow-orb absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-accent-gradient opacity-[0.06]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-8 sm:py-8">
        {/* Top bar: logo + library link */}
        <div className="flex items-center justify-between">
          <BrandLogoLink />
          <Link
            href="/dashboard/library"
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:border-border hover:bg-card/80 hover:text-foreground",
              focusRingClass,
            )}
          >
            <Images className="size-4" strokeWidth={1.75} />
            Library
          </Link>
        </div>

        {/* Welcome — compact */}
        <header className="mt-6 space-y-2 sm:mt-8">
          <h1 className="font-heading text-balance text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            Welcome back, <span className="text-gradient">{displayName}</span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Capture brand context, create on-brand visuals, and keep everything in your library.
          </p>
        </header>

        {/* Tools grid — DNA + Chat + Ad Creatives on the same row */}
        <section className="mt-8 flex flex-1 flex-col sm:mt-10" aria-label="Workspace tools">
          <div className="grid flex-1 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
            <ToolCard
              href="/dashboard/dna"
              title="Brand DNA"
              description="Paste a URL and extract that site's branding — colors, typography, logos, and voice — saved as reusable context."
              actionLabel="Open DNA"
              icon={<Dna className="h-6 w-6 text-foreground" strokeWidth={1.65} aria-hidden />}
            />
            <ToolCard
              href="/dashboard/chat"
              title="Chat"
              description="Describe what you want in plain language. Aphilio pulls brand context and generates on-brand visuals in the thread."
              actionLabel="Open chat"
              icon={<MessageSquare className="h-6 w-6 text-foreground" strokeWidth={1.65} aria-hidden />}
            />
            <ToolCard
              href="/dashboard/ad-creatives"
              title="Ad Creatives"
              description="Draft on-brand ad concepts, headlines, and copy from your DNA — tuned for social, search, and fast iteration."
              actionLabel="Open ad creatives"
              icon={<LayoutTemplate className="h-6 w-6 text-foreground" strokeWidth={1.65} aria-hidden />}
            />
          </div>
        </section>

        {/* Workflow hint — subtle bottom strip */}
        <footer className="mt-auto shrink-0 pb-2 pt-6 sm:pt-8">
          <div className="flex items-center justify-center gap-6 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground/60 sm:gap-8 sm:text-xs">
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted/60 text-[0.6rem] font-bold text-muted-foreground ring-1 ring-border/50">
                1
              </span>
              Capture
            </span>
            <ArrowRight className="size-3 text-muted-foreground/40" aria-hidden />
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted/60 text-[0.6rem] font-bold text-muted-foreground ring-1 ring-border/50">
                2
              </span>
              Create
            </span>
            <ArrowRight className="size-3 text-muted-foreground/40" aria-hidden />
            <span className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted/60 text-[0.6rem] font-bold text-muted-foreground ring-1 ring-border/50">
                3
              </span>
              Collect
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
