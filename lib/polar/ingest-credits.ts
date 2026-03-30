import { polarClient } from "@/lib/polar/client";
import prisma from "@/lib/prisma";
import type { AdImageGenerationMode } from "@/types/ad-creatives";

const DEFAULT_CREDIT_COST_FAST = 1;
const DEFAULT_CREDIT_COST_PREMIUM = 1.5;

/** Polar credit amount → integer units stored in Postgres (amount × 100, truncated toward zero). */
export function creditAmountToStoredUnits(creditAmount: number): number {
  return Math.trunc(creditAmount * 100);
}

export function creditCostForMode(mode: AdImageGenerationMode): number {
  return mode === "premium"
    ? Number(process.env.APHILIO_CREDIT_COST_PREMIUM ?? DEFAULT_CREDIT_COST_PREMIUM)
    : Number(process.env.APHILIO_CREDIT_COST_FAST ?? DEFAULT_CREDIT_COST_FAST);
}

/**
 * Local DB only: subtract credits immediately (optimistic UI / reservation).
 * Uses the same units as `creditAmountToStoredUnits`.
 */
export async function deductCreditsOptimisticallyLocally(
  userId: string,
  creditAmount: number,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { aphilioCreditsBalance: { decrement: creditAmountToStoredUnits(creditAmount) } },
  });
}

/**
 * Undo {@link deductCreditsOptimisticallyLocally} when the operation that reserved
 * credits fails before Polar should be charged.
 */
export async function revertOptimisticCreditsDeduction(
  userId: string,
  creditAmount: number,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { aphilioCreditsBalance: { increment: creditAmountToStoredUnits(creditAmount) } },
  });
}

/**
 * Fire-and-forget ingest to Polar (meter). Does not touch the local balance.
 * Call only after the billable action succeeds.
 */
export function enqueuePolarCreditUsageIngest(
  userId: string,
  creditAmount: number,
): void {
  if (!process.env.POLAR_ACCESS_TOKEN) return;

  polarClient.events
    .ingest({
      events: [
        {
          name: "credit_usage",
          externalCustomerId: userId,
          metadata: { credit: creditAmount },
        },
      ],
    })
    .catch(() => {
      // Non-fatal: the Polar webhook will re-sync the balance when it arrives.
    });
}

/**
 * Deducts locally then enqueues Polar ingest (both in one call).
 * Prefer {@link deductCreditsOptimisticallyLocally} + success-only
 * {@link enqueuePolarCreditUsageIngest} + {@link revertOptimisticCreditsDeduction} on failure
 * when the billable work is long-running.
 */
export async function ingestCreditUsageForUser(
  userId: string,
  creditAmount: number,
): Promise<void> {
  await deductCreditsOptimisticallyLocally(userId, creditAmount);
  enqueuePolarCreditUsageIngest(userId, creditAmount);
}
