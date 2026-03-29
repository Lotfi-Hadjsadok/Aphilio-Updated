import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

type PageProps = { params: Promise<{ contextId: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { title: t("dnaPageTitle") };
  }
  return { title: t("dnaPageTitle") };
}

export default async function SavedContextPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { contextId } = await params;
  redirect(`/dashboard/dna/${contextId}`);
}
