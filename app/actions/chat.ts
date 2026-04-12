"use server";

import prisma from "@/lib/prisma";
import { loadSavedContext } from "@/app/actions/scrape";
import {
  embedTextsForContextDocuments,
  embeddingArrayToPgVectorLiteral,
  generateImageFromPrompt,
  generateImageFromPromptForContext,
  IMAGE_MODEL_FAST,
  IMAGE_MODEL_PREMIUM,
} from "@/lib/langchain";
import { uploadImageToR2 } from "@/lib/r2";
import {
  requireAuth,
  requireAuthAndSubscription,
  ERR_UNAUTHORIZED,
} from "@/lib/auth-guard";
import { creditCostForMode } from "@/lib/polar/credits-units";
import {
  enqueuePolarCreditUsageIngest,
  reserveCreditsAtGenerationStart,
  revertOptimisticCreditsDeduction,
} from "@/lib/polar/ingest-credits";
import type { AdImageGenerationMode } from "@/types/ad-creatives";
import { isSvgUrl, messageFromUnknownError } from "@/lib/utils";
import type {
  ConversationSummary,
  LoadConversationState,
  PersistedMessage,
  SendChatMessageState,
} from "@/types/chat";
import type { ReferenceImageGroup } from "@/types/ad-creatives";
import type { BrandingPersonality, TypographyEntry } from "@/types/scrape";

/** Prepends the brand logo URL to persisted reference thumbnails (deduped). */
function mergeBrandLogoIntoReferenceUrls(
  referenceUrls: string[],
  logoUrl: string | null,
): string[] {
  const trimmedLogo = logoUrl?.trim();
  if (!trimmedLogo) return referenceUrls;
  const rest = referenceUrls.filter((url) => url.trim() !== trimmedLogo);
  return [trimmedLogo, ...rest];
}

function formatTypographyForPrompt(entries: TypographyEntry[] | null | undefined): string | null {
  if (!entries || entries.length === 0) return null;
  const lines: string[] = [];
  for (const entry of entries) {
    const family = entry.fontfamily?.trim() ?? "";
    if (!family) continue;
    const heading = entry.heading?.trim();
    const body = entry.body?.trim();
    const pieces = [family];
    if (heading) pieces.push(`headings: ${heading}`);
    if (body) pieces.push(`body: ${body}`);
    lines.push(pieces.join(" — "));
  }
  return lines.length > 0 ? lines.join("; ") : null;
}

function rowToPersistedMessage(row: {
  id: string;
  role: string;
  text: string | null;
  imageUrl: string | null;
  aspectRatio: string | null;
  contextId: string | null;
  contextName: string | null;
  referenceImageUrls: unknown;
  createdAt: Date;
}): PersistedMessage {
  return {
    id: row.id,
    role: row.role as "user" | "assistant",
    text: row.text,
    imageUrl: row.imageUrl,
    aspectRatio: row.aspectRatio,
    contextId: row.contextId,
    contextName: row.contextName,
    referenceImageUrls: Array.isArray(row.referenceImageUrls)
      ? (row.referenceImageUrls as string[])
      : [],
    createdAt: row.createdAt.toISOString(),
  };
}

function buildEnrichedPrompt(
  userText: string,
  aspectRatio: string,
  brandName?: string,
  brandBaseUrl?: string,
  personality?: BrandingPersonality | null,
  primaryColor?: string | null,
  similarTexts?: Array<{ heading: string | null; content: string }>,
  typography?: TypographyEntry[] | null,
  brandLogoAttached?: boolean,
): string {
  const lines: string[] = [`Creative brief: ${userText}`];

  if (brandName) {
    lines.push("", "Brand context:", `Brand: ${brandName} (${brandBaseUrl})`);
    if (primaryColor) lines.push(`Primary brand color: ${primaryColor}`);
    if (personality?.tone) lines.push(`Brand tone: ${personality.tone}`);
    if (personality?.energy) lines.push(`Energy: ${personality.energy}`);
    if (personality?.voice) lines.push(`Voice style: ${personality.voice}`);
    if (personality?.communicationStyle)
      lines.push(`Communication style: ${personality.communicationStyle}`);
    if (personality?.valueProposition)
      lines.push(`Value proposition: ${personality.valueProposition}`);
  }

  const typographySummary = formatTypographyForPrompt(typography);
  if (typographySummary) {
    lines.push(
      "",
      "Typography (mandatory): Every on-image headline, subheadline, button label, and caption MUST use ONLY these brand typefaces, respecting heading vs body roles where specified: " +
        typographySummary +
        " Do not substitute system UI fonts, generic grotesks, or lookalike typefaces.",
    );
  }

  if (similarTexts && similarTexts.length > 0) {
    lines.push("", "Relevant brand content:");
    for (const doc of similarTexts) {
      const snippet = doc.content.slice(0, 350);
      lines.push(doc.heading ? `[${doc.heading}] ${snippet}` : snippet);
    }
  }

  if (brandLogoAttached) {
    lines.push(
      "",
      "Brand logo: The official logo is provided as a separate labeled image block immediately after this text. Use that attachment as the only source for the mark — pixel-accurate, no redraw or substitute. " +
        "Unless this brief explicitly requests no logo, include the mark visibly in the final composition.",
    );
  }

  lines.push("", `Generate this creative in ${aspectRatio} aspect ratio.`);

  return lines.join("\n");
}

// ── Text-only similarity search ───────────────────────────────────────────────

async function findSimilarTextForQuery(
  queryText: string,
  contextId: string,
): Promise<Array<{ heading: string | null; content: string }>> {
  const embeddings = await embedTextsForContextDocuments([queryText]);
  const embedding = embeddings[0];
  if (!embedding) return [];

  const queryVectorLiteral = embeddingArrayToPgVectorLiteral(embedding);

  const rows = await prisma.$queryRawUnsafe<
    Array<{ heading: string | null; content: string }>
  >(
    `SELECT
       cd.section  AS heading,
       SUBSTRING(cd.content, 1, 400) AS content
     FROM context_document cd
     WHERE cd."contextId" = $1
       AND cd."embedding_vector" IS NOT NULL
     ORDER BY (cd."embedding_vector" <=> $2::vector) ASC
     LIMIT 5`,
    contextId,
    queryVectorLiteral,
  );

  return rows;
}

// ── Public server functions ───────────────────────────────────────────────────

/** Returns the user's conversations ordered by most recently updated. */
export async function listConversations(): Promise<ConversationSummary[]> {
  const guard = await requireAuth();
  if (!guard.authorized) return [];
  const { userId } = guard;

  const rows = await prisma.chatConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    messageCount: row._count.messages,
  }));
}

/** Fetches all non-SVG image URLs from documents belonging to a context owned by the user. */
export async function getContextImages(contextId: string): Promise<string[]> {
  const guard = await requireAuth();
  if (!guard.authorized || !contextId.trim()) return [];
  const { userId } = guard;

  const ownedContext = await prisma.scrapedContext.findFirst({
    where: { id: contextId, userId },
    select: { id: true },
  });
  if (!ownedContext) return [];

  const rows = await prisma.$queryRawUnsafe<Array<{ url: string }>>(
    `SELECT DISTINCT cdi.url
     FROM context_document_image cdi
     JOIN context_document cd ON cd.id = cdi."documentId"
     WHERE cd."contextId" = $1
     ORDER BY cdi.url
     LIMIT 60`,
    contextId,
  );

  return rows
    .map((row) => row.url?.trim())
    .filter((url): url is string => Boolean(url) && !isSvgUrl(url));
}

// ── Form actions ──────────────────────────────────────────────────────────────

export async function loadConversationMessagesAction(
  _previous: LoadConversationState,
  formData: FormData,
): Promise<LoadConversationState> {
  const guard = await requireAuth();
  if (!guard.authorized) return { status: "error", message: guard.reason };
  const { userId } = guard;

  const conversationId = String(formData.get("conversationId") ?? "").trim();
  if (!conversationId) return { status: "error", message: "Missing conversation ID." };

  const conversation = await prisma.chatConversation.findFirst({
    where: { id: conversationId, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) return { status: "error", message: "Conversation not found." };

  return {
    status: "success",
    conversationId,
    messages: conversation.messages.map(rowToPersistedMessage),
  };
}

export async function sendChatMessageAction(
  _previous: SendChatMessageState,
  formData: FormData,
): Promise<SendChatMessageState> {
  const guard = await requireAuthAndSubscription();
  if (!guard.authorized) return { status: "error", message: guard.reason };
  const { userId } = guard;

  const text = String(formData.get("text") ?? "").trim();
  const conversationId = String(formData.get("conversationId") ?? "").trim() || null;
  const contextId = String(formData.get("contextId") ?? "").trim() || null;
  const rawMode = String(formData.get("imageMode") ?? "fast");
  const aspectRatio = String(formData.get("aspectRatio") ?? "1:1");
  const imageModel = rawMode === "premium" ? IMAGE_MODEL_PREMIUM : IMAGE_MODEL_FAST;

  if (!text) return { status: "error", message: "Please enter a message." };

  let contextImageUrls: string[] = [];
  let uploadedImages: string[] = [];

  try {
    const parsed = JSON.parse(String(formData.get("contextImageUrls") ?? "[]")) as unknown[];
    contextImageUrls = parsed.filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0,
    );
  } catch { contextImageUrls = []; }

  try {
    const parsed = JSON.parse(String(formData.get("uploadedImages") ?? "[]")) as unknown[];
    uploadedImages = parsed.filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0,
    );
  } catch { uploadedImages = []; }

  // ── Gather brand context ─────────────────────────────────────────────────
  let enrichedPrompt = text;
  let logoUrl: string | null = null;
  let contextName: string | undefined;
  let similarTexts: Array<{ heading: string | null; content: string }> = [];

  if (contextId) {
    const contextOwnership = await prisma.scrapedContext.findFirst({
      where: { id: contextId, userId },
      select: { id: true },
    });
    if (!contextOwnership) return { status: "error", message: "Context not found." };

    const [loaded, contextRow] = await Promise.all([
      loadSavedContext(contextId),
      prisma.scrapedContext.findUnique({
        where: { id: contextId },
        select: { logo: true, typography: true },
      }),
    ]);

    const typographyFromRow = Array.isArray(contextRow?.typography)
      ? (contextRow.typography as TypographyEntry[])
      : null;
    const typographyForPrompt =
      loaded.ok && loaded.result.branding?.typography && loaded.result.branding.typography.length > 0
        ? loaded.result.branding.typography
        : typographyFromRow;

    logoUrl = contextRow?.logo?.trim() || null;

    if (loaded.ok) {
      contextName = loaded.result.name;
      similarTexts = await findSimilarTextForQuery(text, contextId);
      enrichedPrompt = buildEnrichedPrompt(
        text,
        aspectRatio,
        loaded.result.name,
        loaded.result.baseUrl,
        loaded.result.personality,
        loaded.result.branding?.colors?.primary,
        similarTexts,
        typographyForPrompt,
        Boolean(logoUrl),
      );
    } else {
      enrichedPrompt = buildEnrichedPrompt(
        text,
        aspectRatio,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        typographyForPrompt,
        Boolean(logoUrl),
      );
    }
  } else {
    enrichedPrompt = buildEnrichedPrompt(text, aspectRatio);
  }

  // ── Build reference image groups (user-chosen only) ──────────────────────
  const referenceImageGroups: ReferenceImageGroup[] = [];

  const filteredContextUrls = contextImageUrls
    .map((url) => url.trim())
    .filter((url) => url && !isSvgUrl(url));
  if (filteredContextUrls.length > 0) {
    referenceImageGroups.push({
      sectionTitle: "Brand context images",
      imageUrls: filteredContextUrls,
    });
  }

  const filteredUploaded = uploadedImages.filter((url) => url.startsWith("data:image/"));

  let uploadedReferenceImageUrls: string[] = [];
  if (filteredUploaded.length > 0) {
    referenceImageGroups.push({
      sectionTitle: "Uploaded reference images",
      imageUrls: filteredUploaded,
    });

    const uploadedReferenceResults = await Promise.all(
      filteredUploaded.map((uploadedImageDataUrl, uploadedImageIndex) =>
        uploadImageToR2({
          sourceUrl: uploadedImageDataUrl,
          key: `chat/${userId}/references/${Date.now()}-${uploadedImageIndex}.webp`,
        }),
      ),
    );
    uploadedReferenceImageUrls = uploadedReferenceResults.map((result) => result.publicUrl);
  }

  const noImagesManuallyProvided =
    filteredContextUrls.length === 0 && filteredUploaded.length === 0;

  const chatImageMode: AdImageGenerationMode =
    rawMode === "premium" ? "premium" : "fast";
  const creditCost = creditCostForMode(chatImageMode);
  const reserved = await reserveCreditsAtGenerationStart(userId, creditCost);
  if (!reserved.ok) {
    return { status: "error", message: reserved.message };
  }

  // ── Generate image ────────────────────────────────────────────────────────
  try {
    let generatedDataUrl: string;
    let autoRagReferenceUrls: string[] = [];

    if (contextId && noImagesManuallyProvided) {
      // No images manually selected — auto-RAG: pick semantically similar context
      // images from the brand DNA, mirroring how ad creatives generation works.
      const ragResult = await generateImageFromPromptForContext(
        enrichedPrompt,
        contextId,
        imageModel,
        logoUrl,
      );
      generatedDataUrl = ragResult.imageUrl;
      autoRagReferenceUrls = ragResult.referenceImageUrls;
    } else {
      generatedDataUrl = await generateImageFromPrompt(
        enrichedPrompt,
        referenceImageGroups,
        logoUrl,
        imageModel,
      );
    }

    const saveContextId = contextId ?? "chat";
    const r2Key = `chat/${userId}/${saveContextId}/${Date.now()}.webp`;
    const uploaded = await uploadImageToR2({ sourceUrl: generatedDataUrl, key: r2Key });

    // Manual references are what the user intentionally picked (shown in the user bubble).
    // Auto-RAG references are only shown below the bot's generated image.
    const manualReferenceUrls: string[] = [...filteredContextUrls, ...uploadedReferenceImageUrls];
    const botReferenceUrls: string[] = mergeBrandLogoIntoReferenceUrls(
      noImagesManuallyProvided ? autoRagReferenceUrls : manualReferenceUrls,
      logoUrl,
    );

    await prisma.generatedCreative.create({
      data: {
        userId,
        contextId: saveContextId,
        r2Key,
        imageUrl: uploaded.publicUrl,
        templateLabel: "Chat",
        aspectRatio,
        headline: text.slice(0, 150),
        subheadline: contextName ?? null,
        prompt: enrichedPrompt,
      },
    });

    // ── Persist conversation + messages ────────────────────────────────────
    let targetConversationId = conversationId;
    let isNewConversation = false;
    let conversationTitle = "New chat";

    if (!targetConversationId) {
      conversationTitle = text.slice(0, 60);
      const newConversation = await prisma.chatConversation.create({
        data: { userId, title: conversationTitle },
      });
      targetConversationId = newConversation.id;
      isNewConversation = true;
    } else {
      const existing = await prisma.chatConversation.findFirst({
        where: { id: targetConversationId, userId },
        select: { title: true },
      });
      if (!existing) return { status: "error", message: "Conversation not found." };
      conversationTitle = existing.title;
      await prisma.chatConversation.update({
        where: { id: targetConversationId },
        data: { updatedAt: new Date() },
      });
    }

    const [userMessage, botMessage] = await Promise.all([
      prisma.chatPersistedMessage.create({
        data: {
          conversationId: targetConversationId,
          role: "user",
          text,
          contextId,
          contextName: contextName ?? null,
          // Only store images the user explicitly chose; auto-RAG refs belong on the bot message.
          referenceImageUrls: manualReferenceUrls,
        },
      }),
      prisma.chatPersistedMessage.create({
        data: {
          conversationId: targetConversationId,
          role: "assistant",
          imageUrl: uploaded.publicUrl,
          aspectRatio,
          contextId,
          contextName: contextName ?? null,
          referenceImageUrls: botReferenceUrls,
        },
      }),
    ]);

    enqueuePolarCreditUsageIngest(userId, creditCost);

    return {
      status: "success",
      conversationId: targetConversationId,
      conversationTitle,
      isNewConversation,
      userMessage: rowToPersistedMessage(userMessage),
      botMessage: rowToPersistedMessage(botMessage),
    };
  } catch (error) {
    await revertOptimisticCreditsDeduction(userId, creditCost);
    return {
      status: "error",
      message: messageFromUnknownError(error, "Failed to generate image. Please try again."),
    };
  }
}

export async function deleteConversationAction(
  _previous: { status: "idle" | "success" | "error"; message?: string },
  formData: FormData,
): Promise<{ status: "idle" | "success" | "error"; message?: string; deletedId?: string }> {
  const guard = await requireAuth();
  if (!guard.authorized) return { status: "error", message: guard.reason };
  const { userId } = guard;

  const conversationId = String(formData.get("conversationId") ?? "").trim();
  if (!conversationId) return { status: "error", message: "Missing conversation ID." };

  await prisma.chatConversation.deleteMany({
    where: { id: conversationId, userId },
  });

  return { status: "success", deletedId: conversationId };
}
