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

const CREDIT_RESERVATION_UPDATE_SQL = `UPDATE "user"
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
       )`;

type SqlExecutor = {
  $executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<unknown>;
};

export async function executeCreditReservationUpdate(
  executor: SqlExecutor,
  costUnits: number,
  userId: string,
): Promise<number> {
  const updated = await executor.$executeRawUnsafe(
    CREDIT_RESERVATION_UPDATE_SQL,
    costUnits,
    userId,
  );
  return Number(updated);
}

type CreditCheckRow = {
  aphilioCreditsBalance: number;
  allowCreditOverage: boolean;
  maxCreditOverageStoredUnits: number | null;
};

function resolveFailureMessageFromRow(row: CreditCheckRow, costUnits: number): string {
  if (!row.allowCreditOverage) {
    return INSUFFICIENT_CREDITS_MESSAGE;
  }
  if (
    row.maxCreditOverageStoredUnits !== null &&
    row.aphilioCreditsBalance + row.maxCreditOverageStoredUnits < costUnits
  ) {
    return SPENDING_CAP_REACHED_MESSAGE;
  }
  return INSUFFICIENT_CREDITS_MESSAGE;
}

async function creditReservationFailureMessage(
  userId: string,
  costUnits: number,
): Promise<string> {
  const userRow = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      aphilioCreditsBalance: true,
      allowCreditOverage: true,
      maxCreditOverageStoredUnits: true,
    },
  });
  if (!userRow) {
    return "Account not found.";
  }
  return resolveFailureMessageFromRow(userRow, costUnits);
}

/**
 * Read-only check before expensive work. Does not change balance; pair with
 * {@link reserveCreditsOnTransaction} after success (same rules as the UPDATE).
 */
export async function assertSufficientCreditsForGeneration(
  userId: string,
  creditAmount: number,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const costUnits = creditAmountToStoredUnits(creditAmount);
  const userRow = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      aphilioCreditsBalance: true,
      allowCreditOverage: true,
      maxCreditOverageStoredUnits: true,
    },
  });
  if (!userRow) {
    return { ok: false, message: "Account not found." };
  }

  const balance = userRow.aphilioCreditsBalance;
  const qualifies =
    (!userRow.allowCreditOverage && balance >= costUnits) ||
    (userRow.allowCreditOverage && userRow.maxCreditOverageStoredUnits === null) ||
    (userRow.allowCreditOverage &&
      userRow.maxCreditOverageStoredUnits !== null &&
      balance + userRow.maxCreditOverageStoredUnits >= costUnits);

  if (qualifies) {
    return { ok: true };
  }

  return { ok: false, message: resolveFailureMessageFromRow(userRow, costUnits) };
}

/**
 * Atomically reserves credits inside an interactive transaction (after billable work succeeds).
 */
export async function reserveCreditsOnTransaction(
  transaction: SqlExecutor,
  userId: string,
  creditAmount: number,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const costUnits = creditAmountToStoredUnits(creditAmount);
  const affected = await executeCreditReservationUpdate(
    transaction,
    costUnits,
    userId,
  );
  if (affected > 0) {
    return { ok: true };
  }
  const message = await creditReservationFailureMessage(userId, costUnits);
  return { ok: false, message };
}

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
  const affected = await executeCreditReservationUpdate(
    prisma,
    costUnits,
    userId,
  );
  if (affected > 0) {
    return { ok: true };
  }

  const message = await creditReservationFailureMessage(userId, costUnits);
  return { ok: false, message };
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
