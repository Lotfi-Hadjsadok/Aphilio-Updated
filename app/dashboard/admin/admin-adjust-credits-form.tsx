"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import {
  adjustAdminCreditsAction,
  type AdjustAdminCreditsState,
} from "@/app/actions/admin";
import { storedCreditsUnitsToDisplay } from "@/lib/polar/credits-units";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialAdjustCreditsState: AdjustAdminCreditsState = { status: "idle" };

type AdminAdjustCreditsFormProps = {
  userId: string;
  creditsBalanceStoredUnits: number;
};

export function AdminAdjustCreditsForm({
  userId,
  creditsBalanceStoredUnits,
}: AdminAdjustCreditsFormProps) {
  const translateAdmin = useTranslations("admin");
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    adjustAdminCreditsAction,
    initialAdjustCreditsState,
  );

  useEffect(() => {
    if (state.status === "success" && state.userId === userId) {
      router.refresh();
    }
  }, [state, userId, router]);

  const showSuccess =
    state.status === "success" && state.userId === userId;
  const showError = state.status === "error";
  const displayBalance = storedCreditsUnitsToDisplay(creditsBalanceStoredUnits);

  return (
    <form
      action={formAction}
      className="w-full min-w-0 space-y-1.5 rounded-md border border-border/50 bg-muted/15 px-2 py-1.5"
    >
      <input type="hidden" name="userId" value={userId} />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="text-muted-foreground">{translateAdmin("creditsBalanceLabel")}</span>
        <span className="font-semibold tabular-nums text-foreground">{displayBalance}</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Input
          name="credits"
          type="number"
          inputMode="decimal"
          min={0.01}
          step={0.01}
          placeholder={translateAdmin("creditsAmountPlaceholder")}
          className="h-8 w-[5.5rem] min-w-0 bg-background/90 text-sm"
          required
          disabled={isPending}
          aria-label={translateAdmin("creditsAmountAriaLabel")}
        />
        {isPending ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
        ) : null}
        <Button
          name="operation"
          value="add"
          type="submit"
          size="sm"
          variant="secondary"
          disabled={isPending}
          className="h-8 px-2.5 text-xs"
        >
          {translateAdmin("addCreditsSubmit")}
        </Button>
        <Button
          name="operation"
          value="subtract"
          type="submit"
          size="sm"
          variant="outline"
          disabled={isPending}
          className="h-8 px-2.5 text-xs"
        >
          {translateAdmin("subtractCreditsSubmit")}
        </Button>
      </div>
      {showError ? (
        <p className="text-destructive text-xs leading-snug" role="alert">
          {state.message}
        </p>
      ) : null}
      {showSuccess ? (
        <p className="text-xs leading-snug text-emerald-600 dark:text-emerald-400">
          {state.operation === "subtract"
            ? translateAdmin("adjustCreditsSuccessSubtract")
            : translateAdmin("adjustCreditsSuccessAdd")}
        </p>
      ) : null}
    </form>
  );
}
