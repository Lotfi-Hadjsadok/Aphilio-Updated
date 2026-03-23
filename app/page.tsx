import Link from "next/link";
import { ArrowRight, Dna, Globe, Shield } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const steps = [
  {
    stepNumber: "01",
    title: "Input your URL",
    description: "Drop a link and we load the real page in a browser.",
  },
  {
    stepNumber: "02",
    title: "We capture context",
    description: "Structured content, assets, and signals — not a static screenshot.",
  },
  {
    stepNumber: "03",
    title: "Review brand DNA",
    description: "Voice, marks, and typography surfaced in one calm view.",
  },
] as const;

export default function Home() {
  return (
    <div className="landing-grid-bg relative flex min-h-[100dvh] flex-col overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="glow-orb absolute -left-24 top-0 h-80 w-80 bg-accent-gradient" />
        <div className="glow-orb absolute -right-20 top-1/3 h-72 w-72 bg-accent-gradient" />
        <div className="glow-orb absolute bottom-0 left-1/3 h-64 w-64 bg-accent-gradient opacity-50" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6">
        <Link href="/" className="font-logo text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
          <span className="text-gradient">Aphilio</span>
        </Link>
        <Link
          href="/sign-in"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "rounded-lg px-4 text-xs font-medium sm:text-sm",
          )}
        >
          Sign in
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-20 pt-4 sm:px-8 sm:pb-24 sm:pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="gradient-pill mb-6 inline-flex tracking-[0.12em]">
            Context from the web
          </span>
          <h1 className="font-heading text-balance text-[2.25rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl sm:leading-[1.06] lg:text-6xl lg:leading-[1.05]">
            Turn any site into{" "}
            <span className="text-gradient">brand-ready</span>
            <br className="hidden sm:block" />
            <span className="sm:ml-1">context.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Capture how a page actually looks and sounds — then ship campaigns, docs, and AI workflows
            that stay on-brand, without the tab sprawl.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/sign-in"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "h-11 min-w-[11rem] rounded-xl px-8 text-sm font-semibold shadow-md sm:h-12 sm:text-base",
              )}
            >
              Get started
              <ArrowRight className="ml-1 size-4 opacity-90" />
            </Link>
            <Link
              href="#how-it-works"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "h-11 rounded-xl text-sm text-muted-foreground hover:text-foreground sm:h-12 sm:text-base",
              )}
            >
              See how it works
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <Globe className="size-4 text-foreground/70" aria-hidden />
              Real browser rendering
            </span>
            <span className="inline-flex items-center gap-2">
              <Dna className="size-4 text-foreground/70" aria-hidden />
              Brand DNA extraction
            </span>
            <span className="inline-flex items-center gap-2">
              <Shield className="size-4 text-foreground/70" aria-hidden />
              Your workspace, your data
            </span>
          </div>
        </div>

        <div id="how-it-works" className="mx-auto mt-16 w-full max-w-5xl scroll-mt-24 sm:mt-20">
          <p className="mb-6 text-center text-[0.65rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            How it works
          </p>
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {steps.map((step) => (
              <div
                key={step.stepNumber}
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-5 text-left shadow-sm ring-1 ring-foreground/[0.04] backdrop-blur-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md sm:p-6"
              >
                <span className="font-heading text-3xl font-bold tabular-nums text-foreground/10 transition-colors group-hover:text-foreground/15">
                  {step.stepNumber}
                </span>
                <h2 className="font-heading mt-2 text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
