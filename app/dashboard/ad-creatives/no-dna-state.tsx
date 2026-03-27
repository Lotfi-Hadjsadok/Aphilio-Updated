import Link from "next/link";
import { Dna } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { stepContentCn } from "./ad-creatives-constants";

export function NoDnaState() {
  return (
    <div className={stepContentCn}>
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div className="w-full max-w-sm rounded-xl border border-dashed border-border/70 bg-muted/10 p-8 text-center">
          <Dna className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 font-heading text-base font-semibold text-foreground">No DNA saved yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Capture a site under DNA first, then return here to generate ad creatives.
          </p>
          <Link
            href="/dashboard/dna"
            className={cn(buttonVariants({ variant: "default", size: "default" }), "mt-6 inline-flex rounded-xl")}
          >
            Go to DNA
          </Link>
        </div>
      </div>
    </div>
  );
}
