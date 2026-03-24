import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Layers, Sparkles, Wand2 } from "lucide-react";
import { BrandLogoLink } from "@/components/brand-logo";

export const metadata = {
  title: "Ad creatives",
  description:
    "Generate on-brand ad concepts, headlines, and copy from the brand DNA you already saved in Aphilio.",
};

export default async function AdCreativesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <main className="landing-grid-bg relative min-h-[100dvh] w-full overflow-x-hidden bg-background px-4 py-10 text-foreground sm:px-8 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute -left-32 top-0 h-80 w-80 bg-accent-gradient" />
        <div className="glow-orb absolute -right-24 bottom-20 h-72 w-72 bg-accent-gradient" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <div className="space-y-4">
          <BrandLogoLink />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Back to dashboard
          </Link>
        </div>

        <div className="mt-10 space-y-3 sm:mt-12">
          <span className="gradient-pill">Tool preview</span>
          <h1 className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.5rem]">
            Ad creatives
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Turn the brand you already captured with DNA into ad-ready concepts: headlines, primary
            text, and channel-specific angles—without re-explaining your colors, type, or voice every
            time.
          </p>
        </div>

        <div className="my-10 h-px bg-border/60 sm:my-12" />

        <section className="space-y-4" aria-labelledby="ad-creatives-what-heading">
          <h2
            id="ad-creatives-what-heading"
            className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl"
          >
            What you’ll use this for
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Describe a campaign, offer, or audience. Aphilio will draft ad concepts and copy that
            stay aligned with your saved DNA—so every line feels like it came from the same brand
            studio, not a generic template.
          </p>
        </section>

        <div className="my-10 h-px bg-border/60 sm:my-12" />

        <section className="space-y-6" aria-labelledby="ad-creatives-channels-heading">
          <h2
            id="ad-creatives-channels-heading"
            className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl"
          >
            Built for how you actually run ads
          </h2>
          <ul className="grid gap-4 sm:grid-cols-1">
            <li className="rounded-[var(--radius)] border border-border/60 bg-muted/20 p-5 sm:p-6">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient-subtle ring-1 ring-border">
                  <Sparkles className="h-5 w-5 text-foreground" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="space-y-2">
                  <p className="font-heading font-semibold text-foreground">Social and display</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Hooks, primary text, and calls to action tuned for feeds and banners—square,
                    vertical, and story-friendly angles when you need them.
                  </p>
                </div>
              </div>
            </li>
            <li className="rounded-[var(--radius)] border border-border/60 bg-muted/20 p-5 sm:p-6">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient-subtle ring-1 ring-border">
                  <Wand2 className="h-5 w-5 text-foreground" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="space-y-2">
                  <p className="font-heading font-semibold text-foreground">Search and extensions</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Headlines and descriptions that respect your tone of voice, so paid search and
                    extensions read like the rest of your brand—not like a keyword dump.
                  </p>
                </div>
              </div>
            </li>
            <li className="rounded-[var(--radius)] border border-border/60 bg-muted/20 p-5 sm:p-6">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient-subtle ring-1 ring-border">
                  <Layers className="h-5 w-5 text-foreground" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="space-y-2">
                  <p className="font-heading font-semibold text-foreground">Variants, fast</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Spin up multiple directions before you brief design or media—so you can test
                    messages and angles without starting from a blank doc each time.
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <div className="my-10 h-px bg-border/60 sm:my-12" />

        <section
          className="rounded-[var(--radius)] border border-dashed border-border/70 bg-muted/15 p-6 sm:p-8"
          aria-labelledby="ad-creatives-dna-heading"
        >
          <h2
            id="ad-creatives-dna-heading"
            className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl"
          >
            Grounded in your DNA
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Your DNA profile is the single source of truth: palette, type, logos, and voice. Ad
            creatives will pull from that context so output stays consistent across campaigns and
            channels.
          </p>
        </section>

        <p className="mt-10 text-center text-xs leading-relaxed text-muted-foreground sm:mt-12">
          The generator is on the way. When it ships, you’ll run it from this page—same workspace,
          same brand context.
        </p>
      </div>
    </main>
  );
}
