import Link from "next/link";
import { CreditCard, Lock } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { settingsCardClassName } from "@/lib/settings-ui";
import { cn } from "@/lib/utils";

type CreditsLockedCtaProps = {
  title: string;
  description: string;
  buttonLabel: string;
};

export function CreditsLockedCta({ title, description, buttonLabel }: CreditsLockedCtaProps) {
  return (
    <Card
      className={cn(
        settingsCardClassName,
        "border-dashed border-border/70 bg-card/65 dark:bg-card/55",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-muted/35 via-transparent to-muted/25"
        aria-hidden
      />
      <CardHeader className="relative border-b border-border/50 bg-muted/[0.06] pb-5 dark:bg-muted/[0.04]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-gradient-subtle ring-1 ring-border/50">
            <Lock className="size-5 text-foreground/80" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5 opacity-70" aria-hidden />
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative p-4 sm:p-6">
        <Link
          href="/api/checkout/start?slug=monthly"
          className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full sm:w-auto")}
        >
          {buttonLabel}
        </Link>
      </CardContent>
    </Card>
  );
}
