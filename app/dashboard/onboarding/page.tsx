import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { OnboardingFlow } from "./onboarding-flow";

export const metadata = {
  title: "Welcome to Aphilio",
  description: "Set up your account and get started with Aphilio.",
};

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });

  if (user?.onboardingCompleted) redirect("/dashboard");

  return (
    <main className="landing-grid-bg relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="glow-orb absolute -left-32 top-0 h-96 w-96 bg-accent-gradient opacity-[0.18] sm:h-[28rem] sm:w-[28rem]" />
        <div className="glow-orb absolute -right-24 bottom-10 h-80 w-80 bg-accent-gradient opacity-[0.14] sm:bottom-20" />
        <div className="glow-orb absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-accent-gradient opacity-[0.08]" />
      </div>
      <OnboardingFlow userName={session.user.name} />
    </main>
  );
}
