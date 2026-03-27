import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Images, Loader2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { BrandLogoLink } from "@/components/brand-logo";
import { getLibraryCreatives } from "@/app/actions/library";
import { LibraryGrid } from "./library-grid";

async function LibraryContent() {
  const { creatives, total } = await getLibraryCreatives(1);
  return <LibraryGrid initialCreatives={creatives} initialTotal={total} />;
}

export default async function LibraryPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <main className="landing-grid-bg relative min-h-[100dvh] w-full overflow-hidden bg-background px-4 py-10 text-foreground sm:px-8 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute -left-32 top-0 h-80 w-80 bg-accent-gradient" />
        <div className="glow-orb absolute -right-24 bottom-20 h-72 w-72 bg-accent-gradient" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <BrandLogoLink />

        {/* Header */}
        <div className="mt-8 space-y-2 sm:mt-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3" />
            Back to dashboard
          </Link>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient-subtle ring-1 ring-border">
              <Images className="h-5 w-5 text-foreground" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Creative Library
              </h1>
              <p className="text-sm text-muted-foreground">
                All your generated ad images, saved automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-border/60 sm:my-10" />

        {/* Library grid — streams in */}
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
