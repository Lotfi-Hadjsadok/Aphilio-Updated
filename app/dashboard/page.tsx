import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Globe } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main className="landing-grid-bg relative min-h-[100dvh] w-full overflow-hidden bg-background px-4 py-10 text-foreground sm:px-8 sm:py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="glow-orb absolute -left-32 top-0 h-72 w-72 bg-accent-gradient" />
        <div className="glow-orb absolute -right-24 bottom-20 h-64 w-64 bg-accent-gradient" />
      </div>

      <div className="relative mx-auto max-w-3xl space-y-12">
        <div className="space-y-3 text-center sm:text-left">
          <span className="gradient-pill">Workspace</span>
          <h1 className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.5rem]">
            Pick up where you left off
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Signed in as{" "}
            <span className="font-medium text-foreground">{session.user.name ?? session.user.email}</span>
            . Jump into your tools below.
          </p>
        </div>

        <div>
          <p className="mb-4 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:mb-5">
            Tools
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/dashboard/context-retriever"
              className="group gradient-border-2 block rounded-[var(--radius)] transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="gradient-border-2-bg relative overflow-hidden rounded-[calc(var(--radius)-1px)] p-6 sm:p-7">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-gradient opacity-25 blur-2xl transition-opacity group-hover:opacity-45" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient-subtle ring-1 ring-border">
                    <Globe className="h-6 w-6 text-foreground" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      Context Retriever
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Paste a URL. We render the page, then surface brand DNA and structured context in one
                      pass — like onboarding a new site in minutes, not hours.
                    </p>
                    <p className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-gradient">
                      Open tool
                      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
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
