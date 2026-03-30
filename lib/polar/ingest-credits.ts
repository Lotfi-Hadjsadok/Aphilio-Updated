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

export const INSUFFICIENT_CREDITS_MESSAGE =
  "You do not have enough credits for this generation. Add credits or enable spending beyond your balance in Settings.";

export const SPENDING_CAP_REACHED_MESSAGE =
  "This generation would exceed your spending limit beyond your balance. Raise the cap in Settings or add credits.";

/**
 * Atomically reserves credits at generation start: decrements local balance only if allowed by
 * balance, overage flag, and optional max overage cap. Call {@link enqueuePolarCreditUsageIngest}
 * only after success; {@link revertOptimisticCreditsDeduction} on failure.
 */
export async function reserveCreditsAtGenerationStart(
  userId: string,
  creditAmount: number,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const costUnits = creditAmountToStoredUnits(creditAmount);
  const updated = await prisma.$executeRawUnsafe(
    `UPDATE "user"
     SET aphilio_credits_balance = aphilio_credits_balance - $1
     WHERE id = $2
       AND (
         (allow_credit_overage = false AND aphilio_credits_balance >= $1)
         OR (
           allow_credit_overage = true
           AND max_credit_overage_stored_units IS NULL
         )
         OR (
           allow_credit_overage = true
           AND max_credit_overage_stored_units IS NOT NULL
           AND aphilio_credits_balance + max_credit_overage_stored_units >= $1
         )
       )`,
    costUnits,
    userId,
  );
  const affected =
    typeof updated === "bigint" ? Number(updated) : Number(updated);
  if (affected > 0) {
    return { ok: true };
  }

  const userRow = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      aphilioCreditsBalance: true,
      allowCreditOverage: true,
      maxCreditOverageStoredUnits: true,
    },
  });
  if (!userRow) {
    return { ok: false, message: "Account not found." };
  }

  if (!userRow.allowCreditOverage) {
    return { ok: false, message: INSUFFICIENT_CREDITS_MESSAGE };
  }
  if (userRow.maxCreditOverageStoredUnits !== null) {
    const headroom =
      userRow.aphilioCreditsBalance + userRow.maxCreditOverageStoredUnits;
    if (headroom < costUnits) {
      return { ok: false, message: SPENDING_CAP_REACHED_MESSAGE };
    }
  }
  return { ok: false, message: INSUFFICIENT_CREDITS_MESSAGE };
}

/**
 * Local DB only: subtract credits without a balance check (legacy / admin). Prefer
 * {@link reserveCreditsAtGenerationStart} for billable generations.
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
  const reserved = await reserveCreditsAtGenerationStart(userId, creditAmount);
  if (!reserved.ok) {
    throw new Error(reserved.message);
  }
  enqueuePolarCreditUsageIngest(userId, creditAmount);
}
