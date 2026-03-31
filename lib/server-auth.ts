import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type ServerSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getServerUserId(): Promise<string | null> {
  const session = await getServerSession();
  return session?.user.id ?? null;
}

/**
 * Whether the signed-in user may use admin APIs (impersonation, list users, etc.).
 * Any user whose `role` includes `admin` has admin capabilities.
 */
export function isPlatformAdmin(session: ServerSession): boolean {
  const role = (session.user.role as string | undefined) ?? "";
  return role.split(",").some((segment) => segment.trim() === "admin");
}
