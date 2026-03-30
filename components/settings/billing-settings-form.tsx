"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { updateBillingSettingsAction } from "@/app/actions/settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { settingsCardClassName, settingsInsetSurfaceClassName } from "@/lib/settings-ui";
import { cn } from "@/lib/utils";

type BillingSettingsFormProps = {
  initialAllowCreditOverage: boolean;
  initialMaxCreditOverageStoredUnits: number | null;
  creditsBalanceDisplay: string;
};

function initialLimitMode(
  allowCreditOverage: boolean,
  maxCreditOverageStoredUnits: number | null,
): "unlimited" | "capped" {
  if (!allowCreditOverage) return "unlimited";
  if (maxCreditOverageStoredUnits === null) return "unlimited";
  return "capped";
}

function initialCappedCreditsInput(maxCreditOverageStoredUnits: number | null): string {
  if (maxCreditOverageStoredUnits === null) return "5";
  return (maxCreditOverageStoredUnits / 100).toString();
}

export function BillingSettingsForm({
  initialAllowCreditOverage,
  initialMaxCreditOverageStoredUnits,
  creditsBalanceDisplay,
}: BillingSettingsFormProps) {
  const t = useTranslations("settings");
  const [allowOverage, setAllowOverage] = useState(initialAllowCreditOverage);
  const [limitMode, setLimitMode] = useState<"unlimited" | "capped">(() =>
    initialLimitMode(initialAllowCreditOverage, initialMaxCreditOverageStoredUnits),
  );
  const [cappedCreditsInput, setCappedCreditsInput] = useState(() =>
    initialCappedCreditsInput(initialMaxCreditOverageStoredUnits),
  );

  const rollbackAllowRef = useRef(initialAllowCreditOverage);
  const rollbackLimitModeRef = useRef<
    "unlimited" | "capped"
  >(initialLimitMode(initialAllowCreditOverage, initialMaxCreditOverageStoredUnits));
  const rollbackCappedRef = useRef(
    initialCappedCreditsInput(initialMaxCreditOverageStoredUnits),
  );

  const [state, formAction, isPending] = useActionState(
    updateBillingSettingsAction,
    { status: "idle" } as const,
  );

  useEffect(() => {
    if (state.status === "success") {
      setAllowOverage(state.allowCreditOverage);
      setLimitMode(state.maxCreditOverageMode);
      setCappedCreditsInput(state.maxCreditOverageCreditsDisplay);
      rollbackAllowRef.current = state.allowCreditOverage;
      rollbackLimitModeRef.current = state.maxCreditOverageMode;
      rollbackCappedRef.current = state.maxCreditOverageCreditsDisplay;
    }
    if (state.status === "error") {
      setAllowOverage(rollbackAllowRef.current);
      setLimitMode(rollbackLimitModeRef.current);
      setCappedCreditsInput(rollbackCappedRef.current);
    }
  }, [state]);

  function submitBillingSettings(nextAllow: boolean, nextMode: "unlimited" | "capped", nextCapped: string) {
    const formData = new FormData();
    formData.set("allowCreditOverage", nextAllow ? "true" : "false");
    formData.set("maxCreditOverageMode", nextMode);
    formData.set("maxCreditOverageCredits", nextCapped.trim());
    startTransition(() => {
      formAction(formData);
    });
  }

  function normalizeCappedCreditsInput(value: string): string {
    const parsed = Number(value.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 5) return "5";
    return value;
  }

  function handleAllowOverageChange(next: boolean) {
    rollbackAllowRef.current = allowOverage;
    rollbackLimitModeRef.current = limitMode;
    rollbackCappedRef.current = cappedCreditsInput;
    setAllowOverage(next);
    if (!next) {
      setLimitMode("unlimited");
      setCappedCreditsInput("");
      submitBillingSettings(false, "unlimited", "");
      return;
    }
    const nextCappedCreditsInput =
      limitMode === "capped" ? normalizeCappedCreditsInput(cappedCreditsInput) : cappedCreditsInput;
    setCappedCreditsInput(nextCappedCreditsInput);
    submitBillingSettings(true, limitMode, nextCappedCreditsInput);
  }

  function handleLimitModeChange(nextMode: "unlimited" | "capped") {
    rollbackAllowRef.current = allowOverage;
    rollbackLimitModeRef.current = limitMode;
    rollbackCappedRef.current = cappedCreditsInput;
    setLimitMode(nextMode);
    if (nextMode === "unlimited") {
      setCappedCreditsInput("");
      submitBillingSettings(true, "unlimited", "");
      return;
    }
    const normalizedCappedCreditsInput = normalizeCappedCreditsInput(cappedCreditsInput);
    setCappedCreditsInput(normalizedCappedCreditsInput);
  }

  function handleSaveCappedLimit() {
    rollbackAllowRef.current = allowOverage;
    rollbackLimitModeRef.current = limitMode;
    rollbackCappedRef.current = cappedCreditsInput;
    const normalizedCappedCreditsInput = normalizeCappedCreditsInput(cappedCreditsInput);
    setCappedCreditsInput(normalizedCappedCreditsInput);
    submitBillingSettings(true, "capped", normalizedCappedCreditsInput);
  }

  return (
    <Card className={cn(settingsCardClassName, "w-full")}>
      <CardHeader className="border-b border-border/50 bg-muted/[0.08] pb-5 dark:bg-muted/[0.06]">
        <CardTitle>{t("creditsTitle")}</CardTitle>
        <CardDescription>{t("creditsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
        <div className="space-y-6">
          <div
            className={cn(
              settingsInsetSurfaceClassName,
              "flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between",
            )}
          >
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-foreground">{t("overageLabel")}</p>
              <p className="text-sm text-muted-foreground">{t("overageDescription")}</p>
            </div>
            <Switch
              checked={allowOverage}
              onCheckedChange={handleAllowOverageChange}
              disabled={isPending}
              aria-label={t("overageAria")}
            />
          </div>

          {allowOverage ? (
            <div className={cn(settingsInsetSurfaceClassName, "space-y-4 p-4 sm:p-5")}>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{t("spendingLimitTitle")}</p>
                <p className="text-sm text-muted-foreground">{t("spendingLimitDescription")}</p>
              </div>

              <fieldset className="space-y-3">
                <legend className="sr-only">{t("spendingLimitTitle")}</legend>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/70 bg-background/40 p-3 text-sm transition-colors hover:bg-background/70">
                  <input
                    type="radio"
                    name="maxCreditOverageMode"
                    className="mt-1 size-4 shrink-0 rounded-full border border-input"
                    checked={limitMode === "unlimited"}
                    onChange={() => handleLimitModeChange("unlimited")}
                    disabled={isPending}
                  />
                  <span>
                    <span className="font-medium text-foreground">{t("spendingLimitUnlimited")}</span>
                    <span className="mt-0.5 block text-muted-foreground">{t("spendingLimitUnlimitedHint")}</span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/70 bg-background/40 p-3 text-sm transition-colors hover:bg-background/70">
                  <input
                    type="radio"
                    name="maxCreditOverageMode"
                    className="mt-1 size-4 shrink-0 rounded-full border border-input"
                    checked={limitMode === "capped"}
                    onChange={() => handleLimitModeChange("capped")}
                    disabled={isPending}
                  />
                  <span className="min-w-0 flex-1 space-y-2">
                    <span className="font-medium text-foreground">{t("spendingLimitCapped")}</span>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        type="number"
                        inputMode="decimal"
                        min={5}
                        step={1}
                        value={cappedCreditsInput}
                        onChange={(event) => setCappedCreditsInput(event.target.value)}
                        disabled={isPending || limitMode !== "capped"}
                        className="w-full sm:max-w-[220px]"
                        aria-label={t("spendingLimitCappedInputAria")}
                      />
                      <span className="text-muted-foreground">{t("creditsUnit")}</span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isPending || limitMode !== "capped"}
                        onClick={handleSaveCappedLimit}
                      >
                        {t("saveSpendingLimit")}
                      </Button>
                    </div>
                    <span className="block text-muted-foreground">{t("spendingLimitCappedHint")}</span>
                  </span>
                </label>
              </fieldset>
            </div>
          ) : null}

          {state.status === "error" ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {state.message}
            </p>
          ) : null}
          {state.status === "success" ? (
            <p className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              {t("saved")}
            </p>
          ) : null}
        </div>

        <aside className="relative overflow-hidden rounded-xl border border-border/60 bg-accent-gradient-subtle p-4 shadow-inner ring-1 ring-border/40 sm:p-5">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-gradient opacity-[0.14] blur-2xl dark:opacity-[0.2]"
            aria-hidden
          />
          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("balanceLabel")}
            </p>
            <p className="mt-2 font-heading text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {creditsBalanceDisplay}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t("balanceHint")}</p>
          </div>
        </aside>
      </CardContent>
    </Card>
  );
}
