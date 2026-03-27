import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listSavedContexts } from "@/app/actions/scrape";
import { ScrapeForm } from "../context-retriever/scrape-form";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "DNA",
  description:
    "DNA extracts branding from the website you paste: colors, typography, logos, and voice from that page.",
};

export default async function DnaPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });
  if (!user?.onboardingCompleted) redirect("/dashboard/onboarding");

  const savedContexts = await listSavedContexts();

  return (
    <main className="landing-grid-bg relative flex h-[100dvh] min-h-0 w-full flex-col overflow-x-hidden overflow-y-hidden bg-background text-foreground antialiased">
      <ScrapeForm savedContexts={savedContexts} />
    </main>
  );
}

