/**
 * Pure credit unit helpers — safe to import from client components.
 * Database and Polar ingest live in {@link ./ingest-credits} (server-only).
 */
import type { AdImageGenerationMode } from "@/types/ad-creatives";

const DEFAULT_CREDIT_COST_FAST = 1;
const DEFAULT_CREDIT_COST_PREMIUM = 1.5;

/** Polar credit amount → integer units stored in Postgres (amount × 100, truncated toward zero). */
export function creditAmountToStoredUnits(creditAmount: number): number {
  return Math.trunc(creditAmount * 100);
}

/** Display string for cached balance (stored units → credits, up to 2 decimal places). */
export function storedCreditsUnitsToDisplay(storedUnits: number): string {
  const value = storedUnits / 100;
  if (!Number.isFinite(value)) {
    return "0";
  }
  const formatted = value.toFixed(2);
  const trimmed = formatted.replace(/\.?0+$/, "");
  return trimmed.length > 0 ? trimmed : "0";
}

export function creditCostForMode(mode: AdImageGenerationMode): number {
  return mode === "premium"
    ? Number(process.env.APHILIO_CREDIT_COST_PREMIUM ?? DEFAULT_CREDIT_COST_PREMIUM)
    : Number(process.env.APHILIO_CREDIT_COST_FAST ?? DEFAULT_CREDIT_COST_FAST);
}

/** Same units as DB / {@link reserveCreditsAtGenerationStart}; driven by env credit amounts. */
export function creditStoredUnitsForMode(mode: AdImageGenerationMode): number {
  return creditAmountToStoredUnits(creditCostForMode(mode));
}

export const INSUFFICIENT_CREDITS_MESSAGE =
  "You do not have enough credits for this generation. Add credits or enable spending beyond your balance in Settings.";

export const SPENDING_CAP_REACHED_MESSAGE =
  "This generation would exceed your spending limit beyond your balance. Raise the cap in Settings or add credits.";
