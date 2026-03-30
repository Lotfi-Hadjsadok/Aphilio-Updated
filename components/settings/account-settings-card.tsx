import { getTranslations } from "next-intl/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { settingsCardClassName, settingsInsetSurfaceClassName } from "@/lib/settings-ui";
import { cn } from "@/lib/utils";

type AccountSettingsCardProps = {
  displayName: string;
  email: string;
  imageUrl: string | null | undefined;
  memberSince: Date;
  providerLabel: string;
  locale: string;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  const first = parts[0]!.charAt(0);
  const last = parts[parts.length - 1]!.charAt(0);
  return `${first}${last}`.toUpperCase();
}

export async function AccountSettingsCard({
  displayName,
  email,
  imageUrl,
  memberSince,
  providerLabel,
  locale,
}: AccountSettingsCardProps) {
  const t = await getTranslations("settings");
  const formattedMemberSince = memberSince.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className={cn(settingsCardClassName, "overflow-hidden")}>
      <CardHeader className="border-b border-border/50 bg-muted/[0.08] pb-5 dark:bg-muted/[0.06]">
        <CardTitle>{t("accountTitle")}</CardTitle>
        <CardDescription>{t("accountDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="size-20 rounded-2xl object-cover shadow-md ring-2 ring-border/50 sm:size-24"
              />
            ) : (
              <div
                className={cn(
                  "flex size-20 items-center justify-center rounded-2xl bg-accent-gradient-subtle font-heading text-xl font-semibold text-foreground shadow-inner ring-2 ring-border/50 sm:size-24 sm:text-2xl",
                )}
                aria-hidden
              >
                {initialsFromName(displayName)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {displayName}
            </p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <Separator className="my-6 bg-border/60" />

        <dl className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className={cn(settingsInsetSurfaceClassName, "p-4")}>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("accountName")}
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{displayName}</dd>
          </div>
          <div className={cn(settingsInsetSurfaceClassName, "p-4")}>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("accountEmail")}
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground break-all">{email}</dd>
          </div>
          <div className={cn(settingsInsetSurfaceClassName, "p-4")}>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("accountProvider")}
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{providerLabel}</dd>
          </div>
          <div className={cn(settingsInsetSurfaceClassName, "p-4")}>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("accountMemberSince")}
            </dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{formattedMemberSince}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
