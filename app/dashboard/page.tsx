import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="text-zinc-600">
        {session.user.name ?? session.user.email ?? "Signed in"}
      </p>
    </main>
  );
}
