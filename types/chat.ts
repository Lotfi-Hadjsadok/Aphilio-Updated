export type ChatImageMode = "fast" | "premium";

export type ChatAspectRatio = "1:1" | "16:9" | "9:16" | "4:5" | "2:3";

export type PersistedMessage = {
  id: string;
  role: "user" | "assistant";
  text: string | null;
  imageUrl: string | null;
  aspectRatio: string | null;
  contextId: string | null;
  contextName: string | null;
  referenceImageUrls: string[];
  createdAt: string;
};

export type ConversationSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
};

export type SendChatMessageState =
  | { status: "idle" }
  | {
      status: "success";
      conversationId: string;
      conversationTitle: string;
      isNewConversation: boolean;
      userMessage: PersistedMessage;
      botMessage: PersistedMessage;
    }
  | { status: "error"; message: string };

export type LoadConversationState =
  | { status: "idle" }
  | {
      status: "success";
      conversationId: string;
      messages: PersistedMessage[];
    }
  | { status: "error"; message: string };
