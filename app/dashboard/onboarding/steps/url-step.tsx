"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, ArrowRight } from "lucide-react";

export function UrlStep({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a website URL.");
      return;
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    } catch {
      setError("Please enter a valid URL.");
      return;
    }

    setError("");
    onSubmit(parsed.href);
  }

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center">
      <div className="flex w-full max-w-xl flex-col items-center gap-8 text-center">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-gradient-subtle shadow-lg ring-1 ring-border/60 sm:h-20 sm:w-20">
          <Globe className="h-8 w-8 text-foreground sm:h-10 sm:w-10" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            What&apos;s your website?
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            We&apos;ll analyze your site to extract your brand DNA — colors, fonts, logo, and voice —
            so everything we generate is on-brand.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex w-full max-w-lg flex-col gap-4">
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 shadow-sm transition-all focus-within:border-foreground/20 focus-within:ring-2 focus-within:ring-ring/40 focus-within:shadow-md">
            <Globe className="size-5 shrink-0 text-muted-foreground/60" aria-hidden />
            <Input
              type="text"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setError("");
              }}
              placeholder="https://yoursite.com"
              className="h-14 border-0 bg-transparent text-base shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0 sm:text-lg"
              autoFocus
            />
          </label>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mx-auto h-13 w-full max-w-xs rounded-xl px-8 text-base font-semibold sm:h-14"
          >
            Continue
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
