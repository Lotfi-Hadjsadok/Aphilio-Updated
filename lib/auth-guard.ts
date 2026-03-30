import "server-only";

import { getServerUserId, getServerSession } from "@/lib/server-auth";
import { getUserSubscriptionStatus } from "@/lib/polar/subscription";

export const ERR_UNAUTHORIZED = "Unauthorized";
export const ERR_NOT_SUBSCRIBED = "Active subscription required.";

type AuthSuccess = { authorized: true; userId: string };
type AuthFailure = { authorized: false; reason: string };
export type AuthGuardResult = AuthSuccess | AuthFailure;

export async function requireAuth(): Promise<AuthGuardResult> {
  const userId = await getServerUserId();
  if (!userId) return { authorized: false, reason: ERR_UNAUTHORIZED };
  return { authorized: true, userId };
}

export async function requireAuthAndSubscription(): Promise<AuthGuardResult> {
  const userId = await getServerUserId();
  if (!userId) return { authorized: false, reason: ERR_UNAUTHORIZED };
  const subscribed = await getUserSubscriptionStatus(userId);
  if (!subscribed) return { authorized: false, reason: ERR_NOT_SUBSCRIBED };
  return { authorized: true, userId };
}

export async function requireSessionAndSubscription(): Promise<
  | { authorized: true; userId: string; session: NonNullable<Awaited<ReturnType<typeof getServerSession>>> }
  | AuthFailure
> {
  const session = await getServerSession();
  if (!session) return { authorized: false, reason: ERR_UNAUTHORIZED };
  const subscribed = await getUserSubscriptionStatus(session.user.id);
  if (!subscribed) return { authorized: false, reason: ERR_NOT_SUBSCRIBED };
  return { authorized: true, userId: session.user.id, session };
}
