"use client";

import {
  Suspense,
  useActionState,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  startTransition,
} from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  ArrowUp,
  Coins,
  ImagePlus,
  Loader2,
  Menu,
  PenSquare,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import {
  sendChatMessageAction,
  loadConversationMessagesAction,
  deleteConversationAction,
  getContextImages,
} from "@/app/actions/chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { ASPECT_RATIOS, EMPTY_IMAGES_PROMISE } from "./lib/constants";
import { resizeImageToBase64 } from "./lib/helpers";

import { BotAvatar } from "./components/bot-avatar";
import { UserBubble } from "./components/user-bubble";
import { BotBubble } from "./components/bot-bubble";
import { LoadingBotBubble } from "./components/loading-bot-bubble";
import { ErrorBubble } from "./components/error-bubble";
import { WelcomeScreen } from "./components/welcome-screen";
import { ContextImagesGrid } from "./components/context-images-grid";
import { ConversationSidebar } from "./components/conversation-sidebar";
import { UploadedThumb } from "./components/uploaded-thumb";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { DashboardBackIcon } from "@/components/dashboard/dashboard-back-icon";
import {
  dashboardToolHeaderActionsClass,
  dashboardToolHeaderBarClass,
  dashboardToolHeaderPrimaryClass,
  dashboardToolHeaderRowClass,
} from "@/lib/dashboard-tool-layout";
import { APHILIO_GA_EVENTS } from "@/lib/analytics/events";
import { trackGaEvent } from "@/lib/analytics/track-client";

import type { SavedContextSummary } from "@/types/scrape";
import type {
  ChatAspectRatio,
  ChatImageMode,
  ConversationSummary,
  LoadConversationState,
  PersistedMessage,
  SendChatMessageState,
} from "@/types/chat";

type ChatInterfaceProps = {
  savedContexts: SavedContextSummary[];
  initialConversations: ConversationSummary[];
  initialContextId?: string;
  currentLocale: string;
  initialCreditsBalanceStored: number;
  creditCostStoredUnitsByMode: Record<ChatImageMode, number>;
};

export function ChatInterface({
  savedContexts,
  initialConversations,
  initialContextId,
  currentLocale,
  initialCreditsBalanceStored,
  creditCostStoredUnitsByMode,
}: ChatInterfaceProps) {
  const t = useTranslations("chat");
  const tCommon = useTranslations("common");
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<PersistedMessage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [imageMode, setImageMode] = useState<ChatImageMode>("fast");
  const [aspectRatio, setAspectRatio] = useState<ChatAspectRatio>("1:1");
  const [selectedContextId, setSelectedContextId] = useState<string>(initialContextId ?? "");
  const [selectedContextImageUrls, setSelectedContextImageUrls] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [textValue, setTextValue] = useState("");

  const [balanceAdjustmentStoredUnits, setBalanceAdjustmentStoredUnits] = useState(0);
  const displayCredits = (initialCreditsBalanceStored + balanceAdjustmentStoredUnits) / 100;
  const displayCreditsFormatted = displayCredits.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const pendingCreditCostRef = useRef(0);

  const messagesScrollRootRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendWasPendingRef = useRef(false);

  function scrollMessagesViewportToEnd(behavior: ScrollBehavior = "auto") {
    const root = messagesScrollRootRef.current;
    const viewport = root?.querySelector(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLElement | null;
    if (viewport) {
      const targetTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      viewport.scrollTo({ top: targetTop, behavior });
    }
    messagesEndRef.current?.scrollIntoView({
      block: "end",
      inline: "nearest",
      behavior,
    });
  }

  const [contextImagesPromise, setContextImagesPromise] =
    useState<Promise<string[]>>(EMPTY_IMAGES_PROMISE);

  useEffect(() => {
    if (selectedContextId) {
      setContextImagesPromise(getContextImages(selectedContextId));
      setSelectedContextImageUrls([]);
    } else {
      setContextImagesPromise(EMPTY_IMAGES_PROMISE);
      setSelectedContextImageUrls([]);
    }
  }, [selectedContextId]);

  // ── Load conversation ────────────────────────────────────────────────────
  const [loadState, loadDispatch] = useActionState<LoadConversationState, FormData>(
    loadConversationMessagesAction,
    { status: "idle" },
  );

  useEffect(() => {
    if (loadState.status !== "success") return;
    if (loadState.conversationId !== activeConversationId) return;
    setLocalMessages(loadState.messages);
  }, [loadState, activeConversationId]);

  // ── Send message ─────────────────────────────────────────────────────────
  const sendInitialState: SendChatMessageState = { status: "idle" };
  const [sendState, sendDispatch, isSendPending] = useActionState(
    sendChatMessageAction,
    sendInitialState,
  );

  useEffect(() => {
    if (isSendPending) {
      sendWasPendingRef.current = true;
      return;
    }
    if (sendWasPendingRef.current) {
      sendWasPendingRef.current = false;
      if (sendState.status === "success") {
        trackGaEvent(APHILIO_GA_EVENTS.chatGenerationComplete, {
          image_mode: imageMode,
          aspect_ratio: aspectRatio,
          has_context: Boolean(selectedContextId),
          is_new_conversation: sendState.isNewConversation,
          context_image_count: selectedContextImageUrls.length,
          uploaded_image_count: uploadedImages.length,
        });
      } else if (sendState.status === "error") {
        trackGaEvent(APHILIO_GA_EVENTS.chatGenerationError, {
          image_mode: imageMode,
          aspect_ratio: aspectRatio,
        });
      }
    }
  }, [
    isSendPending,
    sendState,
    imageMode,
    aspectRatio,
    selectedContextId,
    selectedContextImageUrls.length,
    uploadedImages.length,
  ]);

  useEffect(() => {
    if (isSendPending) return;
    if (sendState.status === "success") {
      pendingCreditCostRef.current = 0;
      setLocalMessages((prev) => {
        const withoutOptimistic = prev.filter(
          (message) => !message.id.startsWith("optimistic-"),
        );
        return [...withoutOptimistic, sendState.userMessage, sendState.botMessage];
      });

      if (sendState.isNewConversation) {
        setActiveConversationId(sendState.conversationId);
        setConversations((prev) => [
          {
            id: sendState.conversationId,
            title: sendState.conversationTitle,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 2,
          },
          ...prev,
        ]);
      } else {
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === sendState.conversationId
              ? { ...conversation, updatedAt: new Date().toISOString() }
              : conversation,
          ),
        );
      }
    } else if (sendState.status === "error") {
      if (pendingCreditCostRef.current > 0) {
        setBalanceAdjustmentStoredUnits((prev) => prev + pendingCreditCostRef.current);
        pendingCreditCostRef.current = 0;
      }
    }
  }, [isSendPending, sendState]);

  // ── Delete conversation ──────────────────────────────────────────────────
  const [, deleteDispatch] = useActionState(deleteConversationAction, { status: "idle" });

  async function handleDeleteConversation(conversationId: string) {
    setDeletingId(conversationId);
    const formData = new FormData();
    formData.append("conversationId", conversationId);
    trackGaEvent(APHILIO_GA_EVENTS.chatConversationDeleted, {});
    startTransition(() => {
      deleteDispatch(formData);
    });
    setConversations((prev) => prev.filter((conversation) => conversation.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
      setLocalMessages([]);
    }
    setDeletingId(null);
  }

  // ── Scroll to bottom after paint (history load + new messages; viewport is ScrollArea, not window)
  useLayoutEffect(() => {
    if (localMessages.length === 0 && !isSendPending) return;

    const runScroll = () => {
      scrollMessagesViewportToEnd("auto");
    };

    runScroll();
    let innerFrameId = 0;
    const outerFrameId = requestAnimationFrame(() => {
      runScroll();
      innerFrameId = requestAnimationFrame(runScroll);
    });
    const settleTimer = window.setTimeout(runScroll, 0);
    const settleTimer2 = window.setTimeout(runScroll, 100);

    return () => {
      cancelAnimationFrame(outerFrameId);
      cancelAnimationFrame(innerFrameId);
      window.clearTimeout(settleTimer);
      window.clearTimeout(settleTimer2);
    };
  }, [localMessages, isSendPending, activeConversationId]);

  // ── Conversation switching ───────────────────────────────────────────────
  function handleSelectConversation(conversationId: string) {
    if (conversationId === activeConversationId) return;
    setActiveConversationId(conversationId);
    setLocalMessages([]);
    setSidebarOpen(false);
    const formData = new FormData();
    formData.append("conversationId", conversationId);
    startTransition(() => loadDispatch(formData));
  }

  function handleNewChat() {
    setActiveConversationId(null);
    setLocalMessages([]);
    setSidebarOpen(false);
  }

  // ── File upload ──────────────────────────────────────────────────────────
  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const dataUrls = await Promise.all(files.map(resizeImageToBase64));
    setUploadedImages((prev) => [...prev, ...dataUrls]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Context image toggle ────────────────────────────────────────────────
  const handleToggleContextImage = useCallback((url: string) => {
    setSelectedContextImageUrls((prev) =>
      prev.includes(url) ? prev.filter((selected) => selected !== url) : [...prev, url],
    );
  }, []);

  // ── Form submit ──────────────────────────────────────────────────────────
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = textValue.trim();
    if (!text || isSendPending) return;

    // Capture FormData before any state mutations so hidden inputs retain their values
    const formData = new FormData(event.currentTarget);

    trackGaEvent(APHILIO_GA_EVENTS.chatGenerationStart, {
      image_mode: imageMode,
      aspect_ratio: aspectRatio,
      has_context: Boolean(selectedContextId),
      context_image_count: selectedContextImageUrls.length,
      uploaded_image_count: uploadedImages.length,
    });

    const optimisticUserMessage: PersistedMessage = {
      id: `optimistic-${Date.now()}`,
      role: "user",
      text,
      imageUrl: null,
      aspectRatio: null,
      contextId: selectedContextId || null,
      contextName: null,
      referenceImageUrls: [...selectedContextImageUrls, ...uploadedImages],
      createdAt: new Date().toISOString(),
    };

    const costUnits = creditCostStoredUnitsByMode[imageMode];
    pendingCreditCostRef.current = costUnits;
    setBalanceAdjustmentStoredUnits((prev) => prev - costUnits);

    // Urgent (non-transition) updates — render immediately
    setLocalMessages((prev) => [...prev, optimisticUserMessage]);
    setTextValue("");
    setUploadedImages([]);

    // Server action runs as a background transition
    startTransition(() => {
      sendDispatch(formData);
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const form = event.currentTarget.closest("form");
      if (form) form.requestSubmit();
    }
  }

  const isLoadingMessages =
    loadState.status === "idle" && activeConversationId !== null && localMessages.length === 0;
  const hasAttachments = selectedContextImageUrls.length > 0 || uploadedImages.length > 0;
  const selectedContext = savedContexts.find((context) => context.id === selectedContextId);

  return (
    <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onDelete={handleDeleteConversation}
        deletingId={deletingId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <div className="retriever-shell-bg flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Desktop header */}
        <header className={cn(dashboardToolHeaderBarClass, "hidden shadow-sm md:block")}>
          <div
            className={cn(
              dashboardToolHeaderRowClass,
              "gap-2 py-2.5 md:gap-4 md:py-4",
            )}
          >
            <div className={dashboardToolHeaderPrimaryClass}>
              <DashboardBackIcon
                ariaLabel={tCommon("backToDashboard")}
                title={tCommon("back")}
              />
              <div className="flex min-w-0 items-center gap-2">
                <Image
                  unoptimized
                  src="/aphilio-logo.webp"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 shrink-0 object-contain"
                />
                <span className="font-heading truncate text-base font-semibold text-foreground">
                  Chat
                </span>
              </div>
            </div>
            <div className={dashboardToolHeaderActionsClass}>
              <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                <Coins className="size-3 shrink-0" aria-hidden />
                <span className="tabular-nums">{displayCreditsFormatted}</span>
              </div>
              <LanguageSwitcher currentLocale={currentLocale} />
              <LogoutButton
                className="h-8 px-2.5 text-xs"
                label={tCommon("logout")}
              />
              <button
                type="button"
                onClick={handleNewChat}
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                aria-label={t("newButton")}
              >
                <PenSquare className="size-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile header */}
        <header className={cn(dashboardToolHeaderBarClass, "shadow-sm md:hidden")}>
          <div
            className={cn(
              dashboardToolHeaderRowClass,
              "gap-2 py-2.5 md:gap-4 md:py-4",
            )}
          >
            <div className={dashboardToolHeaderPrimaryClass}>
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                aria-label={tCommon("openConversations")}
              >
                <Menu className="size-4" />
              </button>
              <DashboardBackIcon
                ariaLabel={tCommon("backToDashboard")}
                title={tCommon("back")}
              />
              <div className="flex min-w-0 items-center gap-2">
                <Image
                  unoptimized
                  src="/aphilio-logo.webp"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 shrink-0 object-contain"
                />
                <span className="font-heading min-w-0 truncate text-base font-semibold text-foreground">
                  Chat
                </span>
              </div>
            </div>
            <div className={dashboardToolHeaderActionsClass}>
              <div className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                <Coins className="size-3 shrink-0" aria-hidden />
                <span className="tabular-nums">{displayCreditsFormatted}</span>
              </div>
              <LanguageSwitcher
                currentLocale={currentLocale}
                className="max-w-[min(11rem,46vw)] sm:max-w-[13rem]"
              />
              <LogoutButton
                className="h-8 px-2.5 text-xs"
                label={tCommon("logout")}
              />
              <button
                type="button"
                onClick={handleNewChat}
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                aria-label={t("newButton")}
              >
                <PenSquare className="size-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Messages — only this region scrolls; page stays viewport-locked */}
        <div ref={messagesScrollRootRef} className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full min-h-0 overflow-hidden">
            <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 py-3 sm:px-8 sm:py-4 md:px-10">
              {isLoadingMessages ? (
                <div className="flex min-h-0 flex-1 items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : localMessages.length === 0 ? (
                <WelcomeScreen />
              ) : (
                <div className="flex flex-col gap-8">
                  {localMessages.map((message) =>
                    message.role === "user" ? (
                      <UserBubble key={message.id} message={message} />
                    ) : (
                      <BotBubble key={message.id} message={message} />
                    ),
                  )}
                  {isSendPending && <LoadingBotBubble />}
                  {sendState.status === "error" && !isSendPending && (
                    <ErrorBubble text={sendState.message} />
                  )}
                  <div ref={messagesEndRef} className="h-px w-full shrink-0" aria-hidden />
                </div>
              )}

              {sendState.status === "error" && !isSendPending && localMessages.length === 0 && (
                <div className="mt-4 flex justify-center">
                  <div className="flex items-start gap-2">
                    <BotAvatar />
                    <div className="rounded-2xl rounded-tl-sm border border-red-300 bg-red-50 px-5 py-4 text-base text-red-700">
                      {sendState.message}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-border/50 bg-card/30 shadow-[0_-1px_0_0_oklch(0_0_0_/0.04)] backdrop-blur-xl dark:shadow-[0_-1px_0_0_oklch(1_0_0_/0.06)]">
          <div className="mx-auto w-full max-w-5xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8 md:px-10">
            {/* Image attachments row */}
            {hasAttachments && (
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {selectedContextImageUrls.map((url) => (
                  <div
                    key={url}
                    className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-border shadow-sm"
                  >
                    <Image
                      unoptimized
                      src={url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                    <button
                      type="button"
                      onClick={() => handleToggleContextImage(url)}
                      className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl-md bg-card/95 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                ))}
                {uploadedImages.map((dataUrl, index) => (
                  <UploadedThumb
                    key={index}
                    dataUrl={dataUrl}
                    onRemove={() =>
                      setUploadedImages((prev) =>
                        prev.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  />
                ))}
              </div>
            )}

            {/* Context image picker panel */}
            {showImagePanel && selectedContextId && (
              <div className="mb-2 rounded-2xl border border-border/80 bg-muted/40 p-3 shadow-inner sm:p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("contextImagesPickTitle", { name: selectedContext?.name ?? "" })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowImagePanel(false)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <Suspense
                  fallback={
                    <div className="flex items-center gap-2 py-3">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{t("loadingImages")}</span>
                    </div>
                  }
                >
                  <ContextImagesGrid
                    promise={contextImagesPromise}
                    selectedUrls={selectedContextImageUrls}
                    onToggle={handleToggleContextImage}
                  />
                </Suspense>
              </div>
            )}

            {/* Controls row — nowrap + horizontal scroll so long i18n strings do not wrap when Images+ appears */}
            <div className="mb-2 flex min-h-10 flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 [&::-webkit-scrollbar]:hidden">
              <Select
                value={selectedContextId}
                onValueChange={(value) => {
                  setSelectedContextId(value ?? "");
                  setShowImagePanel(false);
                }}
                disabled={isSendPending}
              >
                <SelectTrigger className="h-10 w-full min-w-[9rem] max-w-[12rem] shrink-0 border-border bg-muted/30 text-sm text-foreground shadow-sm sm:w-[12rem] sm:min-w-[12rem] sm:max-w-[12rem]">
                  <span className="min-w-0 flex-1 overflow-hidden text-left">
                    {selectedContext ? (
                      <span className="block truncate font-medium">{selectedContext.name}</span>
                    ) : (
                      <SelectValue placeholder={t("noContext")} />
                    )}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <span className="text-muted-foreground">{t("noContext")}</span>
                  </SelectItem>
                  {savedContexts.map((context) => (
                    <SelectItem key={context.id} value={context.id}>
                      <span className="font-medium">{context.name}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">{context.baseUrl}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Aspect ratio pills */}
              <div className="flex shrink-0 items-center gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.value}
                    type="button"
                    onClick={() => setAspectRatio(ratio.value)}
                    disabled={isSendPending}
                    className={cn(
                      "flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 text-xs font-medium transition-all disabled:opacity-40",
                      aspectRatio === ratio.value
                        ? "border-transparent bg-accent-gradient text-white shadow-md"
                        : "border-border bg-card/80 text-foreground/80 hover:border-border hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <div
                      className={cn(
                        "shrink-0 border",
                        aspectRatio === ratio.value
                          ? "border-white/80"
                          : "border-muted-foreground/50",
                        ratio.shape,
                      )}
                    />
                    {ratio.label}
                  </button>
                ))}
              </div>

              {/* Context image picker button */}
              {selectedContextId && (
                <button
                  type="button"
                  onClick={() => setShowImagePanel((prev) => !prev)}
                  disabled={isSendPending}
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 text-xs font-medium transition-all disabled:opacity-40",
                    showImagePanel || selectedContextImageUrls.length > 0
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border bg-card/80 text-foreground/80 hover:border-border hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <ImagePlus className="size-3" />
                  {selectedContextImageUrls.length > 0
                    ? selectedContextImageUrls.length === 1
                      ? t("selectedImagesOne", { count: selectedContextImageUrls.length })
                      : t("selectedImagesOther", { count: selectedContextImageUrls.length })
                    : t("imagesButton")}
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSendPending}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-border bg-card/80 px-3 text-xs text-foreground/80 transition-colors hover:bg-muted/50 hover:text-foreground disabled:opacity-40"
                title={tCommon("uploadImage")}
              >
                {tCommon("uploadImage")}
              </button>

              {/* Image quality — compact segmented control (matches h-10 toolbar) */}
              <div
                role="radiogroup"
                aria-label={t("imageQualityAria")}
                className="ml-auto inline-flex h-10 shrink-0 items-stretch whitespace-nowrap rounded-xl border border-border bg-muted/50 p-0.5"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={imageMode === "fast"}
                  title={t("qualityQuickerDrafts")}
                  disabled={isSendPending}
                  onClick={() => setImageMode("fast")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all disabled:opacity-40 sm:px-3",
                    imageMode === "fast"
                      ? "bg-card text-foreground shadow-sm ring-1 ring-border/80"
                      : "text-muted-foreground hover:bg-muted/70",
                  )}
                >
                  <Zap
                    className={cn(
                      "size-3.5 shrink-0",
                      imageMode === "fast" ? "text-amber-500" : "text-muted-foreground/70",
                    )}
                    aria-hidden
                  />
                  {tCommon("fast")}
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={imageMode === "premium"}
                  title={t("qualityRicherDetail")}
                  disabled={isSendPending}
                  onClick={() => setImageMode("premium")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all disabled:opacity-40 sm:px-3",
                    imageMode === "premium"
                      ? "bg-card text-foreground shadow-sm ring-1 ring-violet-300/60 dark:ring-violet-500/35"
                      : "text-muted-foreground hover:bg-muted/70",
                  )}
                >
                  <Sparkles
                    className={cn(
                      "size-3.5 shrink-0",
                      imageMode === "premium" ? "text-violet-600" : "text-muted-foreground/70",
                    )}
                    aria-hidden
                  />
                  {tCommon("premium")}
                </button>
              </div>
            </div>

            {/* Text + send */}
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="conversationId" value={activeConversationId ?? ""} />
              <input type="hidden" name="contextId" value={selectedContextId} />
              <input type="hidden" name="imageMode" value={imageMode} />
              <input type="hidden" name="aspectRatio" value={aspectRatio} />
              <input
                type="hidden"
                name="contextImageUrls"
                value={JSON.stringify(selectedContextImageUrls)}
              />
              <input
                type="hidden"
                name="uploadedImages"
                value={JSON.stringify(uploadedImages)}
              />

              <div className="flex items-center gap-3 rounded-2xl border border-border/90 bg-card/95 px-4 py-3 shadow-sm transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring/30">
                <Textarea
                  name="text"
                  value={textValue}
                  onChange={(event) => setTextValue(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("inputPlaceholder")}
                  rows={1}
                  className="max-h-48 min-h-[1.75rem] flex-1 resize-none border-0 bg-transparent py-1 text-base leading-7 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:opacity-60"
                />
                <Button
                  type="submit"
                  disabled={isSendPending || !textValue.trim()}
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full bg-accent-gradient text-white hover:opacity-90 disabled:opacity-30"
                  aria-label="Send"
                >
                  <ArrowUp className="size-4" />
                </Button>
              </div>

              <p className="mt-1.5 text-center text-[0.65rem] text-muted-foreground sm:text-xs">
                Enter to send · Shift+Enter for new line
              </p>
            </form>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
