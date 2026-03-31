"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, Loader2 } from "lucide-react";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type ImpersonationBannerProps = {
  impersonatedByUserId: string;
};

export function ImpersonationBanner({
  impersonatedByUserId,
}: ImpersonationBannerProps) {
  const router = useRouter();
  const t = useTranslations("admin");
  const [isStopping, setIsStopping] = useState(false);

  return (
    <div
      role="status"
      className="flex shrink-0 flex-wrap items-center justify-center gap-3 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-center text-sm text-amber-950 dark:border-amber-400/35 dark:bg-amber-500/10 dark:text-amber-50"
    >
      <Eye className="size-4 shrink-0 text-amber-700 dark:text-amber-200" aria-hidden />
      <span className="min-w-0 flex-1 text-balance">{t("impersonationBanner")}</span>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="shrink-0"
        disabled={isStopping}
        onClick={async () => {
          setIsStopping(true);
          try {
            await authClient.admin.stopImpersonating();
            router.refresh();
          } finally {
            setIsStopping(false);
          }
        }}
      >
        {isStopping ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : null}
        {t("stopImpersonating")}
      </Button>
      <span className="sr-only">
        {t("impersonationAdminIdLabel")}: {impersonatedByUserId}
      </span>
    </div>
  );
}
