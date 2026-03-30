import type { CustomerState } from "@polar-sh/sdk/models/components/customerstate.js";
import type { CustomerStateSubscription } from "@polar-sh/sdk/models/components/customerstatesubscription.js";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import type { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { creditAmountToStoredUnits } from "@/lib/polar/ingest-credits";
import { polarClient } from "@/lib/polar/client";

let cachedAphilioCreditsMeterId: string | null | undefined;

async function resolveAphilioCreditsMeterId(): Promise<string | null> {
  if (cachedAphilioCreditsMeterId !== undefined) {
    return cachedAphilioCreditsMeterId;
  }
  const benefitId = process.env.POLAR_APHILIO_CREDITS_ID;
  if (!benefitId || !process.env.POLAR_ACCESS_TOKEN) {
    cachedAphilioCreditsMeterId = null;
    return null;
  }
  try {
    const benefit = await polarClient.benefits.get({ id: benefitId });
    if (benefit.type === "meter_credit") {
      cachedAphilioCreditsMeterId = benefit.properties.meterId;
      return cachedAphilioCreditsMeterId;
    }
  } catch {
    // Polar unavailable or invalid benefit id
  }
  cachedAphilioCreditsMeterId = null;
  return null;
}

/**
 * Persists Polar's customer UUID after signup. Polar's plugin creates the customer
 * in beforeCreate; this runs in a global `databaseHooks.user.create.after` hook (last).
 */
export async function persistPolarCustomerIdForNewUser(user: {
  id: string;
  email: string;
}): Promise<void> {
  if (!process.env.POLAR_ACCESS_TOKEN || !user.email) return;
  try {
    const { result } = await polarClient.customers.list({ email: user.email });
    const polarCustomer = result.items[0];
    if (!polarCustomer) return;
    await prisma.user.update({
      where: { id: user.id },
      data: { polarCustomerId: polarCustomer.id },
    });
  } catch {
    // Avoid failing user signup if Polar is temporarily unavailable
  }
}

function primaryActiveSubscription(
  activeSubscriptions: CustomerStateSubscription[],
): CustomerStateSubscription | null {
  if (activeSubscriptions.length === 0) return null;
  return activeSubscriptions.reduce((best, candidate) => {
    const bestEnd = best.currentPeriodEnd?.getTime() ?? 0;
    const candidateEnd = candidate.currentPeriodEnd?.getTime() ?? 0;
    return candidateEnd >= bestEnd ? candidate : best;
  });
}

function creditsBalanceFromState(
  state: CustomerState,
  meterId: string,
): number {
  const meter = state.activeMeters.find(
    (entry) => entry.meterId === meterId,
  );
  return Math.max(0, creditAmountToStoredUnits(meter?.balance ?? 0));
}

type SyncPolarCustomerStateContext = {
  /**
   * Full subscription from a Polar webhook (`onSubscription*`).
   * When customer state has no active subscription row, these fields still carry
   * `canceled`, `unpaid`, `endedAt`, etc., so we persist them instead of clearing.
   */
  subscriptionFromWebhook?: Subscription;
};

/**
 * Updates `polarCustomerId` and optional `aphilioCreditsBalance` from a Polar customer state payload.
 * Subscription display columns are left unchanged when there is no active subscription in state and
 * no `subscriptionFromWebhook` (avoids wiping `canceled` / ended status after a prior webhook).
 */
export async function syncLocalUserFromPolarCustomerState(
  state: CustomerState,
  context?: SyncPolarCustomerStateContext,
): Promise<void> {
  const externalId = state.externalId;
  if (!externalId) return;

  const meterId = await resolveAphilioCreditsMeterId();
  const creditsBalance =
    meterId !== null ? creditsBalanceFromState(state, meterId) : undefined;

  const primarySubscription = primaryActiveSubscription(
    state.activeSubscriptions,
  );
  const hasActive = primarySubscription !== null;

  const webhookSubscription = context?.subscriptionFromWebhook;
  const webhookMatchesUser =
    webhookSubscription?.customer.externalId === externalId;

  const data: Prisma.UserUpdateInput = {
    polarCustomerId: state.id,
    hasActiveSubscription: hasActive,
    ...(creditsBalance !== undefined
      ? { aphilioCreditsBalance: creditsBalance }
      : {}),
  };

  if (primarySubscription) {
    data.polarSubscriptionStatus = primarySubscription.status;
    data.polarSubscriptionCurrentPeriodEnd =
      primarySubscription.currentPeriodEnd;
    data.polarSubscriptionEndsAt = primarySubscription.endsAt;
  } else if (webhookMatchesUser && webhookSubscription) {
    data.polarSubscriptionStatus = String(webhookSubscription.status);
    data.polarSubscriptionCurrentPeriodEnd =
      webhookSubscription.currentPeriodEnd;
    data.polarSubscriptionEndsAt =
      webhookSubscription.endsAt ?? webhookSubscription.endedAt;
  }

  await prisma.user.update({
    where: { id: externalId },
    data,
  });
}

export async function syncLocalUserFromSubscription(
  subscription: Subscription,
): Promise<void> {
  const externalId = subscription.customer.externalId;
  if (!externalId || !process.env.POLAR_ACCESS_TOKEN) return;
  try {
    const state = await polarClient.customers.getStateExternal({
      externalId,
    });
    await syncLocalUserFromPolarCustomerState(state, {
      subscriptionFromWebhook: subscription,
    });
  } catch {
    // Webhook handler logs in auth config if needed
  }
}

export async function syncLocalUserByPolarCustomerId(
  polarCustomerId: string,
): Promise<void> {
  if (!process.env.POLAR_ACCESS_TOKEN) return;
  try {
    const customer = await polarClient.customers.get({ id: polarCustomerId });
    const externalId = customer.externalId;
    if (!externalId) return;
    const state = await polarClient.customers.getStateExternal({
      externalId,
    });
    await syncLocalUserFromPolarCustomerState(state);
  } catch {
    // Benefit grant payloads may reference customers without external_id yet
  }
}
