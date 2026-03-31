"use server";

import { getTranslations } from "next-intl/server";

import { creditAmountToStoredUnits } from "@/lib/polar/credits-units";
import {
  ingestPolarCreditGrant,
  ingestPolarCreditUsageAwait,
} from "@/lib/polar/ingest-credits";
import { getServerSession, isPlatformAdmin } from "@/lib/server-auth";
import prisma from "@/lib/prisma";

export type AdjustAdminCreditsState =
  | { status: "idle" }
  | { status: "success"; userId: string; operation: "add" | "subtract" }
  | { status: "error"; message: string };

export async function adjustAdminCreditsAction(
  _previous: AdjustAdminCreditsState,
  formData: FormData,
): Promise<AdjustAdminCreditsState> {
  const translateAdmin = await getTranslations("admin");
  const session = await getServerSession();

  if (!session || !isPlatformAdmin(session)) {
    return { status: "error", message: translateAdmin("grantCreditsErrorUnauthorized") };
  }

  const targetUserId = String(formData.get("userId") ?? "").trim();
  const credits = Number(
    String(formData.get("credits") ?? "").trim().replace(",", "."),
  );
  const operation: "add" | "subtract" =
    String(formData.get("operation") ?? "") === "subtract" ? "subtract" : "add";

  if (!targetUserId) {
    return { status: "error", message: translateAdmin("grantCreditsErrorMissingUser") };
  }
  if (!Number.isFinite(credits) || credits <= 0) {
    return { status: "error", message: translateAdmin("grantCreditsErrorInvalidAmount") };
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, aphilioCreditsBalance: true },
  });
  if (!target) {
    return { status: "error", message: translateAdmin("grantCreditsErrorUserNotFound") };
  }

  const deltaUnits = creditAmountToStoredUnits(credits);

  if (operation === "subtract" && target.aphilioCreditsBalance < deltaUnits) {
    return { status: "error", message: translateAdmin("adjustCreditsInsufficientBalance") };
  }

  try {
    if (operation === "add") {
      await ingestPolarCreditGrant(targetUserId, credits);
    } else {
      await ingestPolarCreditUsageAwait(targetUserId, credits);
    }
  } catch {
    return { status: "error", message: translateAdmin("grantCreditsErrorPolar") };
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      aphilioCreditsBalance: {
        [operation === "add" ? "increment" : "decrement"]: deltaUnits,
      },
    },
  });

  return { status: "success", userId: targetUserId, operation };
}
