"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SignInPage() {
  return (
    <main className="landing-grid-bg relative flex min-h-[100dvh] flex-col items-center justify-center bg-background p-6">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute left-1/4 top-1/4 h-80 w-80 bg-accent-gradient" />
        <div className="glow-orb absolute right-1/4 bottom-1/4 h-64 w-64 bg-accent-gradient" />
      </div>

      <div className="relative mx-auto flex w-full max-w-sm flex-col gap-5">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 w-fit rounded-lg text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back to home
        </Link>

        <div className="gradient-border-2 w-full">
          <div className="gradient-border-2-bg flex flex-col items-center gap-7 rounded-[calc(var(--radius)-1px)] px-7 py-9 sm:px-8 sm:py-10">
            {/* Brand mark */}
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="font-logo text-4xl font-semibold tracking-tight sm:text-5xl">
                <span className="text-gradient">Aphilio</span>
              </p>
              <p className="mt-1 max-w-[24ch] text-pretty text-sm leading-relaxed text-muted-foreground">
                Sign in once. Your captured contexts and brand signals stay in this workspace.
              </p>
            </div>

            <div className="h-px w-full bg-border/60" />

            {/* Auth */}
            <div className="flex w-full flex-col items-center gap-4">
              <span className="gradient-pill text-[0.6rem] tracking-[0.14em]">Secure access</span>
              <p className="text-center text-sm font-medium text-foreground">Welcome back</p>
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Continue with Google — no new password to remember.
              </p>
              <button
                type="button"
                className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-secondary px-4 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() =>
                  void authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/dashboard",
                  })
                }
              >
                <svg className="h-4 w-4 shrink-0" aria-hidden viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
