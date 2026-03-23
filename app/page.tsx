import Link from "next/link";
import { ArrowRight, Dna, Globe, Shield } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const steps = [
  {
    stepNumber: "01",
    title: "Input your URL",
    description: "Drop a link and we load the real page in a real browser session.",
  },
  {
    stepNumber: "02",
    title: "We capture context",
    description: "Structured content, assets, and signals — not a dead static fetch.",
  },
  {
    stepNumber: "03",
    title: "Review brand DNA",
    description: "Voice, marks, and typography surfaced in one calm, structured view.",
  },
] as const;

const trustItems = [
  { icon: Globe, label: "Real browser rendering" },
  { icon: Dna, label: "Brand DNA extraction" },
  { icon: Shield, label: "Your workspace, your data" },
] as const;

export default function Home() {
  return (
    <div className="landing-grid-bg relative flex min-h-[100dvh] flex-col overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute -left-28 -top-10 h-[28rem] w-[28rem] bg-accent-gradient" />
        <div className="glow-orb absolute -right-20 top-1/3 h-80 w-80 bg-accent-gradient" />
        <div className="glow-orb absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 bg-accent-gradient opacity-40" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6">
        <Link href="/" className="font-logo text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
          <span className="text-gradient">Aphilio</span>
        </Link>
        <Link
          href="/sign-in"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5 rounded-xl px-5 text-sm font-medium",
          )}
        >
          Sign in
          <ArrowRight className="size-3.5 opacity-60" />
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pb-24 pt-6 sm:px-8 sm:pb-28 sm:pt-10 lg:pb-32 lg:pt-14">
        {/* Hero */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="gradient-pill mb-7 tracking-[0.13em]">Context from the web</span>

          <h1 className="font-heading max-w-4xl text-balance text-[2.4rem] font-semibold leading-[1.07] tracking-tight sm:text-[3.25rem] sm:leading-[1.06] lg:text-[4.5rem] lg:leading-[1.04]">
            Turn any site into{" "}
            <span className="text-gradient">brand-ready</span>{" "}
            context.
          </h1>

          <p className="mx-auto mt-6 max-w-[50ch] text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Capture how a page actually looks and sounds — then ship campaigns, docs, and AI
            workflows that stay on-brand, without the tab sprawl.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/sign-in"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "h-12 min-w-[12.5rem] rounded-xl px-8 text-sm font-semibold shadow-md sm:text-base",
              )}
            >
              Get started free
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
            <Link
              href="#how-it-works"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "h-12 rounded-xl text-sm text-muted-foreground hover:text-foreground sm:text-base",
              )}
            >
              See how it works
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {trustItems.map(({ icon: TrustIcon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 text-xs text-muted-foreground sm:text-sm"
              >
                <TrustIcon className="size-4 text-foreground/50" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* How it works */}
        <section
          id="how-it-works"
          className="mx-auto mt-20 w-full max-w-5xl scroll-mt-24 sm:mt-24 lg:mt-32"
          aria-labelledby="how-it-works-title"
        >
          <div className="mb-10 space-y-2 text-center">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              How it works
            </p>
            <h2
              id="how-it-works-title"
              className="font-heading text-xl font-semibold tracking-tight sm:text-2xl"
            >
              Three steps. One structured result.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {steps.map((step) => (
              <div
                key={step.stepNumber}
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-5 text-left shadow-sm ring-1 ring-foreground/[0.03] backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-6"
              >
                <div
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent-gradient opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-10"
                  aria-hidden
                />
                <span className="font-heading text-3xl font-bold tabular-nums text-foreground/[0.08] transition-colors group-hover:text-foreground/[0.15]">
                  {step.stepNumber}
                </span>
                <h3 className="font-heading mt-3 text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
