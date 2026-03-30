import prisma from "@/lib/prisma";
import { redirectToPolarProductCheckout } from "@/lib/polar/checkout-redirect";

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
 * Sends unsubscribed users to Polar checkout. Uses cached `hasActiveSubscription` (no Polar API call).
 */
export async function requireActiveSubscriptionOrCheckout(params: {
  userId: string;
  checkoutSlug?: string;
}): Promise<void> {
  const subscribed = await getUserSubscriptionStatus(params.userId);
  if (!subscribed) {
    await redirectToPolarProductCheckout({
      userId: params.userId,
      slug: params.checkoutSlug ?? "monthly",
    });
  }
}
