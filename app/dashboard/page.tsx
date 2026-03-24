import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Dna, LayoutTemplate } from "lucide-react";
import { BrandLogoLink } from "@/components/brand-logo";

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
        <BrandLogoLink />

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
              className="group block rounded-[var(--radius)] bg-muted/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative overflow-hidden rounded-[var(--radius)] p-6 sm:p-7">
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent-gradient opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-45"
                  aria-hidden
                />
                <div className="relative flex flex-col gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient-subtle ring-1 ring-border">
                    <Dna className="h-5 w-5 text-foreground" strokeWidth={1.75} />
                  </div>
                  <div className="space-y-2">
                    <p className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      DNA
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Paste a URL and we extract that website’s branding: colors, typography, logos,
                      and voice.
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

            <Link
              href="/dashboard/ad-creatives"
              className="group block rounded-[var(--radius)] bg-muted/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative overflow-hidden rounded-[var(--radius)] p-6 sm:p-7">
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent-gradient opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-45"
                  aria-hidden
                />
                <div className="relative flex flex-col gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient-subtle ring-1 ring-border">
                    <LayoutTemplate
                      className="h-5 w-5 text-foreground"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      Ad creatives
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Draft on-brand ad concepts, headlines, and copy from the DNA you already
                      saved—built for social, search, and fast iteration.
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
          </div>
        </div>
      </div>
    </main>
  );
}
