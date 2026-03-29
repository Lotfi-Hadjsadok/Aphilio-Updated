"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DeleteAdStudioSessionState } from "@/app/actions/ad-creative-studio-sessions";

export function DeleteStudioSessionDialog({
  sessionId,
  sessionTitle,
  deleteSessionAction,
  deletePending,
  deleteState,
  showTrashAlways,
}: {
  sessionId: string;
  sessionTitle: string;
  deleteSessionAction: (formData: FormData) => void;
  deletePending: boolean;
  deleteState: DeleteAdStudioSessionState;
  showTrashAlways: boolean;
}) {
  const tHistory = useTranslations("adCreatives.history");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (deleteState.status === "success" && deleteState.deletedSessionId === sessionId) {
      setOpen(false);
    }
  }, [deleteState, sessionId]);

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger
        type="button"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-xs" }),
          "shrink-0 text-muted-foreground transition-opacity hover:bg-destructive/10 hover:text-destructive",
          showTrashAlways
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 max-md:opacity-100",
        )}
        disabled={deletePending}
        aria-label={tHistory("deleteSessionAria", { sessionTitle })}
      >
        <Trash2 className="size-3.5" />
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px]" />
        <AlertDialog.Viewport>
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-[80] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/70 bg-background p-5 shadow-xl">
            <AlertDialog.Title className="text-base font-semibold text-foreground">
              {tHistory("deleteSessionTitle")}
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
              {tHistory("deleteSessionDescription", { sessionTitle })}
            </AlertDialog.Description>
            <form
              action={deleteSessionAction}
              className="mt-5 flex items-center justify-end gap-2"
            >
              <input type="hidden" name="studioSessionId" value={sessionId} />
              <AlertDialog.Close
                type="button"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                {tCommon("cancel")}
              </AlertDialog.Close>
              <Button type="submit" variant="destructive" size="sm" disabled={deletePending}>
                {deletePending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {tCommon("delete")}
              </Button>
            </form>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
