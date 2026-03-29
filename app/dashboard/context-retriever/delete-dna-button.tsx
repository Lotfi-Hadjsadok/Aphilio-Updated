"use client";

import { useTranslations } from "next-intl";
import { Loader2, Trash2 } from "lucide-react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DeleteDnaButton({
  contextId,
  contextName,
  deleteFormAction,
  deletePending,
}: {
  contextId: string;
  contextName: string;
  deleteFormAction: (formData: FormData) => void | Promise<void>;
  deletePending: boolean;
}) {
  const tDna = useTranslations("dna");
  const tCommon = useTranslations("common");
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger
        type="button"
        className={cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "shrink-0 rounded-lg text-muted-foreground hover:border-destructive/40 hover:bg-destructive/8 hover:text-destructive",
        )}
        disabled={deletePending}
        aria-label={tDna("deleteBrandingAria")}
      >
        {deletePending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Trash2 className="size-3.5" />
        )}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <AlertDialog.Viewport>
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border-[0.5px] border-border/70 bg-background p-5 shadow-xl">
            <AlertDialog.Title className="text-base font-semibold text-foreground">
              {tDna("deleteTitle")}
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
              {tDna("deleteDescription", { name: contextName })}
            </AlertDialog.Description>
            <form
              action={deleteFormAction}
              className="mt-5 flex items-center justify-end gap-2"
            >
              <input type="hidden" name="contextId" value={contextId} />
              <AlertDialog.Close
                type="button"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
              >
                {tCommon("cancel")}
              </AlertDialog.Close>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={deletePending}
              >
                {tCommon("delete")}
              </Button>
            </form>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
