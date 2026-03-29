"use client";

import Image from "next/image";
import { Loader2, PenSquare, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { dashboardNavPillLinkClassName } from "@/components/dashboard-back-link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { groupConversations } from "../lib/helpers";
import type { ConversationSummary } from "@/types/chat";

type ConversationSidebarProps = {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (conversationId: string) => void;
  onNewChat: () => void;
  onDelete: (conversationId: string) => void;
  deletingId: string | null;
  isOpen: boolean;
  onClose: () => void;
};

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  deletingId,
  isOpen,
  onClose,
}: ConversationSidebarProps) {
  const t = useTranslations("chat");
  const tCommon = useTranslations("common");
  const grouped = groupConversations(conversations);

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-5 max-md:pr-12">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent-gradient-subtle shadow-inner ring-1 ring-border/80">
            <Image
              unoptimized
              src="/aphilio-logo.webp"
              alt=""
              width={28}
              height={28}
              className="h-full w-full object-contain p-0.5"
            />
          </div>
          <span className="font-heading min-w-0 truncate text-base font-semibold tracking-tight text-foreground">
            {t("title")}
          </span>
        </div>
        <button
          type="button"
          onClick={onNewChat}
          className={cn(
            dashboardNavPillLinkClassName,
            "shrink-0 text-foreground hover:text-foreground",
          )}
          title={t("newButton")}
        >
          <PenSquare className="size-3" />
          {t("newButton")}
        </button>
      </div>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <ScrollArea className="flex-1 py-2">
        {grouped.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm leading-relaxed text-muted-foreground">
            {t("noConversations")}
            <br />
            <span className="text-foreground/80">{t("startOne")}</span>
          </p>
        ) : (
          grouped.map((group) => (
            <div key={group.groupKey} className="mb-3">
              <p className="px-4 pb-1 pt-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t(group.groupKey)}
              </p>
              {group.items.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group mx-2 flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors",
                    activeId === conversation.id
                      ? "bg-muted/90 shadow-sm ring-1 ring-border/60"
                      : "hover:bg-muted/50",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium leading-snug text-foreground">
                      {conversation.title}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(conversation.id)}
                    disabled={deletingId === conversation.id}
                    className="ml-1 hidden shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:flex disabled:opacity-50"
                    aria-label={tCommon("deleteConversation")}
                  >
                    {deletingId === conversation.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Trash2 className="size-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-full min-h-0 w-[min(100%,18rem)] shrink-0 border-r border-border/50 bg-card/30 backdrop-blur-xl md:flex md:w-72 md:flex-col">
        {content}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex h-full min-h-0 w-[min(100%,18rem)] flex-col border-r border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
