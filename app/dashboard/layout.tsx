import type { Metadata } from "next";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { ImpersonationBanner } from "@/components/dashboard/impersonation-banner";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const impersonatedByUserId = session?.session.impersonatedBy ?? null;

  return (
    <div className="box-border flex h-dvh max-h-dvh min-h-0 w-full flex-col overflow-hidden">
      {impersonatedByUserId ? (
        <ImpersonationBanner impersonatedByUserId={impersonatedByUserId} />
      ) : null}
      {children}
    </div>
  );
}
