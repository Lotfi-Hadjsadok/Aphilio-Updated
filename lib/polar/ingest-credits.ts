import "server-only";

import { polarClient } from "@/lib/polar/client";
import prisma from "@/lib/prisma";

import {
  creditAmountToStoredUnits,
  INSUFFICIENT_CREDITS_MESSAGE,
  SPENDING_CAP_REACHED_MESSAGE,
} from "@/lib/polar/credits-units";

export {
  creditAmountToStoredUnits,
  creditCostForMode,
  creditStoredUnitsForMode,
  INSUFFICIENT_CREDITS_MESSAGE,
  SPENDING_CAP_REACHED_MESSAGE,
  storedCreditsUnitsToDisplay,
} from "@/lib/polar/credits-units";

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
 * Grants credits on Polar's usage meter: ingest a **negative** `credit` value so the meter
 * increases balance (opposite of {@link enqueuePolarCreditUsageIngest}). Awaits the API call.
 */
export async function ingestPolarCreditGrant(
  externalCustomerId: string,
  grantCreditAmount: number,
): Promise<void> {
  if (!process.env.POLAR_ACCESS_TOKEN) {
    throw new Error("POLAR_ACCESS_TOKEN is not set.");
  }
  if (!Number.isFinite(grantCreditAmount) || grantCreditAmount <= 0) {
    throw new Error("Grant amount must be a positive finite number.");
  }

  await polarClient.events.ingest({
    events: [
      {
        name: "credit_usage",
        externalCustomerId,
        metadata: { credit: -grantCreditAmount },
      },
    ],
  });
}

/**
 * Records usage on Polar's meter (positive `credit` in metadata). Awaits the API call.
 * Use for admin-side decrements so failures surface to the operator.
 */
export async function ingestPolarCreditUsageAwait(
  externalCustomerId: string,
  usageCreditAmount: number,
): Promise<void> {
  if (!process.env.POLAR_ACCESS_TOKEN) {
    throw new Error("POLAR_ACCESS_TOKEN is not set.");
  }
  if (!Number.isFinite(usageCreditAmount) || usageCreditAmount <= 0) {
    throw new Error("Usage amount must be a positive finite number.");
  }

  await polarClient.events.ingest({
    events: [
      {
        name: "credit_usage",
        externalCustomerId,
        metadata: { credit: usageCreditAmount },
      },
    ],
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
