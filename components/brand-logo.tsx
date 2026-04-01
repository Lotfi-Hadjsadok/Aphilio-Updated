"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_PATH = "/aphilio-logo.webp";

type BrandLogoLinkProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  /** `landing` — larger mark + wordmark for marketing pages (home, plans). */
  size?: "header" | "signIn" | "landing";
};

const imageSizeStyles: Record<NonNullable<BrandLogoLinkProps["size"]>, string> = {
  header: "h-11 w-auto sm:h-12",
  signIn: "h-[4.5rem] w-auto sm:h-20",
  landing: "h-12 w-auto sm:h-14 md:h-[4.25rem]",
};

const wordmarkStyles: Record<NonNullable<BrandLogoLinkProps["size"]>, string> = {
  header: "text-2xl font-semibold tracking-tight sm:text-[1.75rem]",
  signIn: "text-4xl font-semibold tracking-tight sm:text-5xl",
  landing: "text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl lg:text-[2.5rem]",
};

export function BrandLogoLink({
  className,
  imageClassName,
  priority,
  size = "header",
}: BrandLogoLinkProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 sm:gap-2",
        size === "landing" && "gap-2 sm:gap-2.5",
        className,
      )}
    >
      <Image
        src={LOGO_PATH}
        alt=""
        width={320}
        height={96}
        priority={priority}
        className={cn(imageSizeStyles[size], imageClassName)}
      />
      <span className={cn("font-logo text-foreground", wordmarkStyles[size])}>Aphilio</span>
    </Link>
  );
}
