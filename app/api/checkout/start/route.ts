import { auth } from "@/lib/auth";
import { resolvePolarProductCheckoutUrl } from "@/lib/polar/checkout-redirect";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const allowedCheckoutSlugs = new Set(["monthly", "yearly"]);

function redirectToPath(request: Request, pathname: string): NextResponse {
  return NextResponse.redirect(new URL(pathname, request.url));
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return redirectToPath(request, "/sign-in");
  }

  const slug =
    new URL(request.url).searchParams.get("slug") ?? "monthly";
  if (!allowedCheckoutSlugs.has(slug)) {
    return redirectToPath(request, "/dashboard");
  }

  const checkoutUrl = await resolvePolarProductCheckoutUrl({
    userId: session.user.id,
    slug,
  });
  if (!checkoutUrl) {
    return redirectToPath(request, "/dashboard");
  }

  return NextResponse.redirect(checkoutUrl);
}
