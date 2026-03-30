import { NextResponse } from "next/server";
import { requireAuthAndSubscription } from "@/lib/auth-guard";
import { runGenerateImageFromFormData } from "@/lib/ad-creatives/generate-image-from-form-data";

export async function POST(request: Request) {
  const guard = await requireAuthAndSubscription();
  if (!guard.authorized) {
    return NextResponse.json({ status: "error" as const, message: guard.reason }, { status: 401 });
  }
  const formData = await request.formData();
  const result = await runGenerateImageFromFormData(guard.userId, formData);
  return NextResponse.json(result);
}
