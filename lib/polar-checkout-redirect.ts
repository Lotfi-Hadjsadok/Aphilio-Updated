import { polarClient } from "@/lib/polar-server";
import { getPolarCheckoutSuccessUrlAbsolute } from "@/lib/polar-checkout-success-url";
import { redirect } from "next/navigation";

const checkoutSlugToProductId: Record<string, string | undefined> = {
  monthly: process.env.POLAR_PRODUCT_ID_MONTHLY,
  yearly: process.env.POLAR_PRODUCT_ID_YEARLY,
};

function polarCheckoutSuccessUrl(): string {
  return getPolarCheckoutSuccessUrlAbsolute();
}

function polarCheckoutReturnUrl(): string {
  const base = (process.env.BETTER_AUTH_URL ?? "").replace(/\/$/, "");
  return `${base}/dashboard`;
}

/**
 * Creates a Polar checkout session and returns its URL, or `null` if checkout cannot be started.
 * Use from Route Handlers with `NextResponse.redirect`; use `redirectToPolarProductCheckout` from RSC/actions.
 */
export async function resolvePolarProductCheckoutUrl(params: {
  userId: string;
  slug: string;
}): Promise<string | null> {
  const productId = checkoutSlugToProductId[params.slug];
  if (!productId || !process.env.POLAR_ACCESS_TOKEN) {
    return null;
  }

  try {
    const checkoutSession = await polarClient.checkouts.create({
      products: [productId],
      externalCustomerId: params.userId,
      successUrl: polarCheckoutSuccessUrl(),
      returnUrl: polarCheckoutReturnUrl(),
    });
    return checkoutSession.url;
  } catch {
    return null;
  }
}

/**
 * Creates a Polar checkout session via the SDK and redirects the user to `checkout.url`.
 */
export async function redirectToPolarProductCheckout(params: {
  userId: string;
  slug: string;
}): Promise<never> {
  const checkoutUrl = await resolvePolarProductCheckoutUrl(params);
  if (!checkoutUrl) {
    redirect("/dashboard");
  }
  redirect(checkoutUrl);
}
