import "server-only";

import prisma from "@/lib/prisma";

const ADMIN_USER_LIMIT = 100;

export type AdminListedUser = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  aphilioCreditsBalance: number;
};

/**
 * Lists users for the admin dashboard with optional case-insensitive email substring search.
 */
export async function listAdminUsersWithCredits(params: {
  emailSearch: string | undefined;
}): Promise<{ users: AdminListedUser[]; total: number }> {
  const trimmed = params.emailSearch?.trim() ?? "";
  const where =
    trimmed.length > 0
      ? {
          email: {
            contains: trimmed,
            mode: "insensitive" as const,
          },
        }
      : undefined;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: ADMIN_USER_LIMIT,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        aphilioCreditsBalance: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}
