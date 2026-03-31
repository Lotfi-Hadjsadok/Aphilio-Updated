"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

type LogoutButtonProps = {
  className?: string;
  /**
   * Pass from `getTranslations("common")` (server) or `useTranslations("common")` (client)
   * so the label always matches the active locale. When omitted, the button resolves `logout` client-side.
   */
  label?: string;
};

export function LogoutButton({ className, label }: LogoutButtonProps) {
  const router = useRouter();
  const t = useTranslations("common");
  const logoutLabel = label ?? t("logout");

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "gap-1.5 rounded-xl px-4 text-sm font-medium",
        className,
      )}
      onClick={() =>
        void authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/");
              router.refresh();
            },
          },
        })
      }
    >
      <LogOut className="size-3.5 shrink-0 opacity-70" aria-hidden />
      {logoutLabel}
    </Button>
  );
}
