import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { plansUrlWithReturn } from "@/lib/plans";

export async function getUserSubscriptionStatus(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasActiveSubscription: true, aphilioCreditsBalance: true },
    });
    if (!user) return false;
    const hasCredits = user.aphilioCreditsBalance > 0;
    return user.hasActiveSubscription || hasCredits;
  } catch {
    return false;
  }
}

/**
 * Subscribed-only app routes: sends logged-in users without an active plan to `/plans`
 * (with optional return path). Uses cached `hasActiveSubscription` and
 * `aphilioCreditsBalance` (no Polar API call): any positive credit balance counts as access
 * (e.g. demo grants via Polar ingest).
 */
export async function requireSubscriptionOrRedirectToPlans(params: {
  userId: string;
  returnTo: string;
}): Promise<void> {
  const subscribed = await getUserSubscriptionStatus(params.userId);
  if (!subscribed) {
    redirect(plansUrlWithReturn(params.returnTo));
  }
}
