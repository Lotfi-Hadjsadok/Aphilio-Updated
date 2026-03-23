import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ScrapeForm } from "./scrape-form";

export const metadata = {
  title: "DNA",
  description: "Capture full-page URL context — brand DNA and visual identity.",
};

export default async function ContextRetrieverPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  redirect("/dashboard/dna");
}
