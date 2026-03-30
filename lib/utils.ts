import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function messageFromUnknownError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function isSvgUrl(url: string): boolean {
  const lowered = url.toLowerCase();
  return (
    lowered.endsWith(".svg") ||
    lowered.includes(".svg?") ||
    lowered.startsWith("data:image/svg")
  );
}
