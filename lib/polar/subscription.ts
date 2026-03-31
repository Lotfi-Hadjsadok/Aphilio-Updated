import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { plansUrlWithReturn } from "@/lib/plans";

export async function getUserSubscriptionStatus(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasActiveSubscription: true },
    });
    return user?.hasActiveSubscription ?? false;
  } catch {
    return false;
  }
}

/**
 * Subscribed-only app routes: sends logged-in users without an active plan to `/plans`
 * (with optional return path). Uses cached `hasActiveSubscription` (no Polar API call).
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
