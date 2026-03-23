import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Globe, ArrowRight, Dna } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const displayName = session.user.name ?? session.user.email;

  return (
    <main className="landing-grid-bg relative min-h-[100dvh] w-full overflow-hidden bg-background px-4 py-10 text-foreground sm:px-8 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute -left-32 top-0 h-80 w-80 bg-accent-gradient" />
        <div className="glow-orb absolute -right-24 bottom-20 h-72 w-72 bg-accent-gradient" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        {/* Wordmark */}
        <Link href="/" className="font-logo text-xl font-semibold tracking-tight sm:text-2xl">
          <span className="text-gradient">Aphilio</span>
        </Link>

        {/* Welcome header */}
        <div className="mt-8 space-y-2 sm:mt-10">
          <span className="gradient-pill">Workspace</span>
          <h1 className="font-heading mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl lg:text-[2.5rem]">
            Welcome back,{" "}
            <span className="text-gradient">{displayName}</span>
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Jump into your tools below and pick up where you left off.
          </p>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-border/60 sm:my-12" />

        {/* Tools section */}
        <div>
          <p className="mb-4 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:mb-5">
            Your tools
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/dashboard/dna"
              className="group gradient-border-2 block rounded-[var(--radius)] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="gradient-border-2-bg relative overflow-hidden rounded-[calc(var(--radius)-1px)] p-6 sm:p-7">
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent-gradient opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-45"
                  aria-hidden
                />
                <div className="relative flex flex-col gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient-subtle ring-1 ring-border">
                    <Globe className="h-5 w-5 text-foreground" strokeWidth={1.75} />
                  </div>
                  <div className="space-y-2">
                    <p className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      DNA
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Paste a URL. We render the page, then surface brand DNA and structured
                      context in one pass — like onboarding a new site in minutes, not hours.
                    </p>
                    <p className="inline-flex items-center gap-1.5 pt-1.5 text-sm font-semibold text-gradient">
                      Open tool
                      <ArrowRight
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Placeholder card — future tool */}
            <div className="flex min-h-[10rem] items-center justify-center rounded-[var(--radius)] border border-dashed border-border/60 bg-muted/20 p-6 text-center sm:p-7">
              <div className="space-y-1.5">
                <Dna className="mx-auto size-6 text-muted-foreground/50" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">More tools coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
