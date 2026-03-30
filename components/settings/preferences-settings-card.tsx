"use client";

import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/language-switcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { settingsCardClassName, settingsInsetSurfaceClassName } from "@/lib/settings-ui";
import { cn } from "@/lib/utils";

type PreferencesSettingsCardProps = {
  currentLocale: string;
};

export function PreferencesSettingsCard({ currentLocale }: PreferencesSettingsCardProps) {
  const t = useTranslations("settings");

  return (
    <Card className={settingsCardClassName}>
      <CardHeader className="border-b border-border/50 bg-muted/[0.08] pb-5 dark:bg-muted/[0.06]">
        <CardTitle>{t("preferencesTitle")}</CardTitle>
        <CardDescription>{t("preferencesDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className={cn(settingsInsetSurfaceClassName, "p-4 sm:p-5")}>
          <p className="text-sm font-medium text-foreground">{t("preferencesLanguageLabel")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("preferencesLanguageDescription")}</p>
          <div className="mt-4 flex justify-start">
            <LanguageSwitcher currentLocale={currentLocale} className="justify-start" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
