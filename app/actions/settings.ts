"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { creditAmountToStoredUnits } from "@/lib/polar/ingest-credits";
import { polarClient } from "@/lib/polar/client";

export type UpdateBillingSettingsState =
  | { status: "idle" }
  | {
      status: "success";
      allowCreditOverage: boolean;
      maxCreditOverageMode: "unlimited" | "capped";
      maxCreditOverageCreditsDisplay: string;
    }
  | { status: "error"; message: string };

export async function updateBillingSettingsAction(
  _previous: UpdateBillingSettingsState,
  formData: FormData,
): Promise<UpdateBillingSettingsState> {
  const guard = await requireAuth();
  if (!guard.authorized) {
    return { status: "error", message: guard.reason };
  }

  const allowRaw = String(formData.get("allowCreditOverage") ?? "false");
  const allowCreditOverage = allowRaw === "true" || allowRaw === "on";

  const limitModeRaw = String(formData.get("maxCreditOverageMode") ?? "unlimited");
  const maxCreditOverageMode =
    limitModeRaw === "capped" ? ("capped" as const) : ("unlimited" as const);

  const cappedCreditsRaw = String(formData.get("maxCreditOverageCredits") ?? "").trim();

  let maxCreditOverageStoredUnits: number | null = null;
  if (allowCreditOverage) {
    if (maxCreditOverageMode === "capped") {
      const normalized = cappedCreditsRaw.replace(",", ".");
      const parsed = Number(normalized);
      if (!Number.isFinite(parsed) || parsed < 5) {
        return {
          status: "error",
          message: "Enter a cap of at least 5 credits, or choose unlimited.",
        };
      }
      maxCreditOverageStoredUnits = creditAmountToStoredUnits(parsed);
    }
  }

  await prisma.user.update({
    where: { id: guard.userId },
    data: {
      allowCreditOverage,
      maxCreditOverageStoredUnits: allowCreditOverage ? maxCreditOverageStoredUnits : null,
    },
  });

  const maxCreditOverageCreditsDisplay =
    allowCreditOverage && maxCreditOverageStoredUnits !== null
      ? (maxCreditOverageStoredUnits / 100).toString()
      : "";

  return {
    status: "success",
    allowCreditOverage,
    maxCreditOverageMode: allowCreditOverage ? maxCreditOverageMode : "unlimited",
    maxCreditOverageCreditsDisplay,
  };
}
