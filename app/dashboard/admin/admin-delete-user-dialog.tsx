"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { AlertDialog } from "@base-ui/react/alert-dialog";

import type { DeleteAdminUserState } from "@/app/actions/admin";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminDeleteUserDialog({
  targetUserId,
  userEmail,
  deleteUserAction,
  deletePending,
  deleteState,
}: {
  targetUserId: string;
  userEmail: string;
  deleteUserAction: (formData: FormData) => void;
  deletePending: boolean;
  deleteState: DeleteAdminUserState;
}) {
  const translateAdmin = useTranslations("admin");
  const translateCommon = useTranslations("common");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (deleteState.status === "success" && deleteState.deletedUserId === targetUserId) {
      setOpen(false);
    }
  }, [deleteState, targetUserId]);

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger
        type="button"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "h-8 w-full gap-1.5 border-destructive/40 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto sm:self-end",
        )}
        disabled={deletePending}
        aria-label={translateAdmin("deleteUserTriggerAria", { email: userEmail })}
      >
        {deletePending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="size-3.5 opacity-90" aria-hidden />
        )}
        {translateAdmin("deleteUser")}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-[2px]" />
        <AlertDialog.Viewport>
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-[120] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/70 bg-background p-5 shadow-xl">
            <AlertDialog.Title className="text-base font-semibold text-foreground">
              {translateAdmin("deleteUserTitle")}
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
              {translateAdmin("deleteUserDescription", { email: userEmail })}
            </AlertDialog.Description>
            <form
              action={deleteUserAction}
              className="mt-5 flex flex-col gap-3"
            >
              <input type="hidden" name="userId" value={targetUserId} />
              {deleteState.status === "error" &&
              deleteState.attemptedUserId === targetUserId ? (
                <p className="text-destructive text-xs leading-snug" role="alert">
                  {deleteState.message}
                </p>
              ) : null}
              <div className="flex items-center justify-end gap-2">
                <AlertDialog.Close
                  type="button"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  {translateCommon("cancel")}
                </AlertDialog.Close>
                <Button type="submit" variant="destructive" size="sm" disabled={deletePending}>
                  {deletePending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
                  {translateAdmin("deleteUserConfirm")}
                </Button>
              </div>
            </form>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
