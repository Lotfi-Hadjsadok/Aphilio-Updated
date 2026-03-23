import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ contextId: string }> };

export async function generateMetadata({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { title: "DNA" };

  // Keep this redirect route lightweight; the destination page sets the real metadata.
  return { title: "DNA" };
}

export default async function SavedContextPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { contextId } = await params;
  redirect(`/dashboard/dna/${contextId}`);
}
