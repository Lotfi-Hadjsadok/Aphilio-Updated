import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Next.js 16 uses `proxy.ts` (replaces `middleware.ts`). Cookie-only checks are
 * fast but not a security boundary — always validate with `auth.api.getSession`
 * in server components / server actions for protected data.
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
