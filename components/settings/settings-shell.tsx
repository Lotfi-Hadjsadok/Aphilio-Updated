"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CreditCard, Globe, Sparkles, UserRound } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  settingsTabShellClassName,
  settingsTabsListClassName,
  settingsTabsTriggerClassName,
} from "@/lib/settings-ui";
import { cn } from "@/lib/utils";

export type SettingsTabValue = "account" | "subscription" | "credits" | "preferences";

function parseTab(value: string | undefined): SettingsTabValue {
  if (
    value === "account" ||
    value === "subscription" ||
    value === "credits" ||
    value === "preferences"
  ) {
    return value;
  }
  return "account";
}

type SettingsShellProps = {
  initialTab: string | undefined;
  accountPanel: ReactNode;
  subscriptionPanel: ReactNode;
  creditsPanel: ReactNode;
  preferencesPanel: ReactNode;
};

export function SettingsShell({
  initialTab,
  accountPanel,
  subscriptionPanel,
  creditsPanel,
  preferencesPanel,
}: SettingsShellProps) {
  const t = useTranslations("settings");
  const defaultTab = parseTab(initialTab);

  return (
    <Tabs
      defaultValue={defaultTab}
      orientation="horizontal"
      className="mt-8 w-full min-w-0 gap-8 sm:mt-10"
    >
      <div
        className={cn(
          settingsTabShellClassName,
          "lg:sticky lg:top-8 lg:z-10 lg:self-start",
        )}
      >
        <TabsList
          variant="default"
          className={settingsTabsListClassName}
          aria-label={t("settingsNavAria")}
        >
          <TabsTrigger value="account" className={settingsTabsTriggerClassName}>
            <UserRound className="shrink-0" aria-hidden />
            <span className="line-clamp-2 max-w-[min(100%,9rem)] sm:truncate sm:max-w-none">
              {t("tabAccount")}
            </span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className={settingsTabsTriggerClassName}>
            <Sparkles className="shrink-0" aria-hidden />
            <span className="line-clamp-2 max-w-[min(100%,9rem)] sm:truncate sm:max-w-none">
              {t("tabSubscription")}
            </span>
          </TabsTrigger>
          <TabsTrigger value="credits" className={settingsTabsTriggerClassName}>
            <CreditCard className="shrink-0" aria-hidden />
            <span className="line-clamp-2 max-w-[min(100%,9rem)] sm:truncate sm:max-w-none">
              {t("tabCredits")}
            </span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className={settingsTabsTriggerClassName}>
            <Globe className="shrink-0" aria-hidden />
            <span className="line-clamp-2 max-w-[min(100%,9rem)] sm:truncate sm:max-w-none">
              {t("tabPreferences")}
            </span>
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="min-w-0">
        <TabsContent value="account" className="mt-0 space-y-4 outline-none">
          {accountPanel}
        </TabsContent>
        <TabsContent value="subscription" className="mt-0 space-y-4 outline-none">
          {subscriptionPanel}
        </TabsContent>
        <TabsContent value="credits" className="mt-0 space-y-4 outline-none">
          {creditsPanel}
        </TabsContent>
        <TabsContent value="preferences" className="mt-0 space-y-4 outline-none">
          {preferencesPanel}
        </TabsContent>
      </div>
    </Tabs>
  );
}
