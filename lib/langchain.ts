import "server-only";

import imageToBase64 from "image-to-base64";
import { lookup as lookupMimeType } from "mime-types";
import sharp from "sharp";
import { OpenAIEmbeddings } from "@langchain/openai";
import { TokenTextSplitter } from "@langchain/textsplitters";
import { ChatGoogle } from "@langchain/google";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import prisma from "@/lib/prisma";
import { isSvgUrl } from "@/lib/utils";
import { DEFAULT_SECTION_TITLE } from "@/lib/ad-creatives/constants";
import {
  BRAND_ANALYSIS_SYSTEM_PROMPT,
  buildBatchAdPromptsSystemPrompt,
  IMAGE_MODEL_LOGO_FIDELITY_RULES,
  IMAGE_MODEL_REFERENCE_IMAGES_RULES,
  IMAGE_MODEL_SYSTEM_PROMPT_BASE,
  LOGO_BLOCK_USER_INSTRUCTION,
  sectionReferenceUserInstruction,
} from "@/lib/ad-creatives/prompts";
import type { BrandingPersonality, BrandingDNA } from "@/types/scrape";
import type {
  AdAspectRatio,
  GeneratedAdPrompt,
  ReferenceImageGroup,
  SimilarDocument,
} from "@/types/ad-creatives";

let embeddingsSingleton: OpenAIEmbeddings | null = null;

function getEmbeddingsModel(): OpenAIEmbeddings {
  if (embeddingsSingleton) return embeddingsSingleton;
  embeddingsSingleton = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
  });
  return embeddingsSingleton;
}

let chatSingleton: ChatGoogle | null = null;

function getChatModel(): ChatGoogle {
  if (chatSingleton) return chatSingleton;
  chatSingleton = new ChatGoogle({
    model: "gemini-2.5-flash",
  });
  return chatSingleton;
}

async function invokeChatWithStructuredJson(
  systemText: string,
  humanPayload: unknown,
  responseSchema: Record<string, unknown>,
): Promise<string> {
  const chatModel = getChatModel();
  const response = await chatModel.invoke(
    [new SystemMessage(systemText), new HumanMessage(JSON.stringify(humanPayload))],
    { responseSchema },
  );
  return typeof response.content === "string" ? response.content : "";
}

/** Cap on reference images passed to the image model; documents are not capped. */
const MAX_REFERENCE_IMAGES = 6;

const EMBEDDING_MODEL_DIMENSIONS = 1536;

/** Serializes a float embedding to a pgvector literal for `$queryRawUnsafe` / `::vector` casts. */
export function embeddingArrayToPgVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

/** text-embedding-3-small hard limit is 8191 tokens; leave a small buffer. */
const EMBEDDING_MAX_TOKENS = 8000;

let embeddingTruncatorSingleton: TokenTextSplitter | null = null;

function getEmbeddingTruncator(): TokenTextSplitter {
  if (embeddingTruncatorSingleton) return embeddingTruncatorSingleton;
  embeddingTruncatorSingleton = new TokenTextSplitter({
    encodingName: "cl100k_base",
    chunkSize: EMBEDDING_MAX_TOKENS,
    chunkOverlap: 0,
  });
  return embeddingTruncatorSingleton;
}

/**
 * Truncates each text to at most {@link EMBEDDING_MAX_TOKENS} tokens before
 * calling the embeddings model. This prevents failures on large website sections
 * that would otherwise exceed the model's 8191-token context limit.
 * Only the first chunk (head of the text) is kept so the section heading and
 * opening content — which carry the most semantic signal — are preserved.
 */
export async function embedTextsForContextDocuments(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const truncator = getEmbeddingTruncator();
  const truncated = await Promise.all(
    texts.map(async (text) => {
      const chunks = await truncator.splitText(text);
      return chunks[0] ?? text.slice(0, 30_000);
    }),
  );
  const model = getEmbeddingsModel();
  return model.embedDocuments(truncated);
}

/**
 * Builds ordered reference groups from similarity-ranked documents, capping total images.
 */
function buildReferenceImageGroupsFromSimilarDocuments(
  similarDocuments: SimilarDocument[],
): ReferenceImageGroup[] {
  const groups: ReferenceImageGroup[] = [];
  let imageCount = 0;
  for (const document of similarDocuments) {
    const urls = document.imageUrls
      .map((url) => url.trim())
      .filter(Boolean)
      .filter((url) => !isSvgUrl(url));
    if (urls.length === 0) continue;
    const remaining = MAX_REFERENCE_IMAGES - imageCount;
    if (remaining <= 0) break;
    const slice = urls.slice(0, remaining);
    groups.push({
      sectionTitle: document.heading?.trim() || DEFAULT_SECTION_TITLE,
      imageUrls: slice,
    });
    imageCount += slice.length;
  }
  return groups;
}

export function flattenReferenceImageUrls(groups: ReferenceImageGroup[]): string[] {
  return groups.flatMap((group) => group.imageUrls);
}

// ── Similarity search ────────────────────────────────────────────────────────

/**
 * Embeds one or more marketing angles (averaged into a single query vector) and
 * returns the top-5 most similar document chunks from the context, along with
 * their associated image URLs (up to 6 total).
 * Used to give the user a preview of which reference images will inform generation.
 */
export async function findSimilarDocumentsForAngles(
  angles: string[],
  contextId: string,
): Promise<{
  similarDocuments: SimilarDocument[];
  referenceImageUrls: string[];
  referenceImageGroups: ReferenceImageGroup[];
}> {
  const validAngles = angles.map((angle) => angle.trim()).filter(Boolean);
  if (validAngles.length === 0 || !contextId.trim()) {
    return { similarDocuments: [], referenceImageUrls: [], referenceImageGroups: [] };
  }

  // Embed all angles and average the vectors to produce one query embedding.
  const embeddings = await embedTextsForContextDocuments(validAngles);
  const dimensions = EMBEDDING_MODEL_DIMENSIONS;
  const averaged = new Array<number>(dimensions).fill(0);
  for (const embedding of embeddings) {
    for (let dimensionIndex = 0; dimensionIndex < dimensions; dimensionIndex++) {
      averaged[dimensionIndex]! += embedding[dimensionIndex]! / embeddings.length;
    }
  }
  const angleEmbedding = averaged;
  if (angleEmbedding.length !== EMBEDDING_MODEL_DIMENSIONS) {
    return { similarDocuments: [], referenceImageUrls: [], referenceImageGroups: [] };
  }

  const queryVectorLiteral = embeddingArrayToPgVectorLiteral(angleEmbedding);

  const rows = await prisma.$queryRawUnsafe<
    Array<{ heading: string | null; content_preview: string; image_urls: string[] }>
  >(
    `WITH ranked AS (
       SELECT
         cd.id,
         cd.section AS heading,
         SUBSTRING(cd.content, 1, 300) AS content_preview,
         (cd."embedding_vector" <=> $2::vector) AS dist
       FROM context_document cd
       WHERE cd."contextId" = $1
         AND cd."embedding_vector" IS NOT NULL
       ORDER BY dist ASC
       LIMIT 5
     )
     SELECT
       r.heading,
       r.content_preview,
       COALESCE(
         array_agg(cdi.url ORDER BY cdi."sortOrder" ASC) FILTER (WHERE cdi.url IS NOT NULL),
         ARRAY[]::text[]
       ) AS image_urls
     FROM ranked r
     LEFT JOIN context_document_image cdi ON cdi."documentId" = r.id
     GROUP BY r.id, r.heading, r.content_preview, r.dist
     ORDER BY r.dist ASC`,
    contextId,
    queryVectorLiteral,
  );

  const similarDocuments: SimilarDocument[] = rows.map((row) => ({
    heading: row.heading,
    contentPreview: row.content_preview,
    imageUrls: Array.isArray(row.image_urls) ? row.image_urls : [],
  }));

  const referenceImageGroups = buildReferenceImageGroupsFromSimilarDocuments(similarDocuments);
  const referenceImageUrls = flattenReferenceImageUrls(referenceImageGroups);

  return { similarDocuments, referenceImageUrls, referenceImageGroups };
}

/**
 * Returns reference images grouped by context document / section, ordered by embedding
 * similarity to the creative prompt. Caps total images at {@link MAX_REFERENCE_IMAGES}.
 */
async function referenceImageGroupsFromPromptSemantics(
  prompt: string,
  contextId: string,
): Promise<ReferenceImageGroup[]> {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt || !contextId.trim()) return [];

  const [promptEmbedding] = await embedTextsForContextDocuments([trimmedPrompt]);
  if (
    !promptEmbedding ||
    promptEmbedding.length !== EMBEDDING_MODEL_DIMENSIONS
  ) {
    return [];
  }

  const queryVectorLiteral = embeddingArrayToPgVectorLiteral(promptEmbedding);

  const rows = await prisma.$queryRawUnsafe<
    Array<{ documentId: string; heading: string | null; url: string }>
  >(
    `WITH ranked AS (
       SELECT
         cd.id AS "documentId",
         cd.section AS heading,
         (cd."embedding_vector" <=> $2::vector) AS dist
       FROM "context_document" cd
       WHERE cd."contextId" = $1
         AND cd."embedding_vector" IS NOT NULL
         AND EXISTS (
           SELECT 1
           FROM "context_document_image" cdi2
           WHERE cdi2."documentId" = cd.id
         )
       ORDER BY dist ASC
       LIMIT 5
     )
     SELECT r."documentId", r.heading, cdi.url
     FROM ranked r
     JOIN "context_document_image" cdi ON cdi."documentId" = r."documentId"
     ORDER BY r.dist ASC, cdi."sortOrder" ASC`,
    contextId,
    queryVectorLiteral,
  );

  const documentOrder: string[] = [];
  const byDocumentId = new Map<string, { heading: string | null; urls: string[] }>();
  for (const row of rows) {
    if (!byDocumentId.has(row.documentId)) {
      byDocumentId.set(row.documentId, { heading: row.heading, urls: [] });
      documentOrder.push(row.documentId);
    }
    const trimmedUrl = row.url?.trim();
    if (trimmedUrl && !isSvgUrl(trimmedUrl)) {
      byDocumentId.get(row.documentId)!.urls.push(trimmedUrl);
    }
  }

  const groups: ReferenceImageGroup[] = [];
  let imageCount = 0;
  for (const documentId of documentOrder) {
    const entry = byDocumentId.get(documentId)!;
    const remaining = MAX_REFERENCE_IMAGES - imageCount;
    if (remaining <= 0) break;
    const slice = entry.urls.slice(0, remaining);
    if (slice.length === 0) continue;
    groups.push({
      sectionTitle: entry.heading?.trim() || DEFAULT_SECTION_TITLE,
      imageUrls: slice,
    });
    imageCount += slice.length;
  }

  return groups;
}

async function getLogoUrlForContext(contextId: string): Promise<string | null> {
  const row = await prisma.scrapedContext.findUnique({
    where: { id: contextId },
    select: { logo: true },
  });
  return row?.logo ?? null;
}

// ── Image helpers ─────────────────────────────────────────────────────────────

type ImageContentBlock = {
  type: "file";
  data?: string;
  mimeType?: string;
};

function extractImageDataFromResponse(contentBlocks: unknown[]): string | null {
  for (const block of contentBlocks) {
    const typed = block as ImageContentBlock;
    if (typed.type === "file" && typed.data) {
      const mimeType = (typed.mimeType || "image/png").split(";")[0];
      return `data:${mimeType};base64,${typed.data}`;
    }
  }
  return null;
}

function mimeTypeFromUrlOrPath(urlOrPath: string): string {
  let pathForLookup = urlOrPath;
  try {
    pathForLookup = new URL(urlOrPath).pathname;
  } catch {
    /* not a URL — use string as path/filename */
  }
  const mimeType = lookupMimeType(pathForLookup);
  return typeof mimeType === "string" && mimeType.startsWith("image/")
    ? mimeType
    : "image/jpeg";
}

type ImageBase64Part = { mimeType: string; base64: string };

function baseImageMimeType(mimeType: string): string {
  return mimeType.split(";")[0].trim().toLowerCase();
}

function isSvgImageMimeType(mimeType: string): boolean {
  const base = baseImageMimeType(mimeType);
  return base === "image/svg+xml" || base === "image/svg";
}

/**
 * Gemini image inputs do not accept `image/svg+xml`; rasterize to PNG for inline data.
 */
async function rasterizeSvgPartToPng(part: ImageBase64Part): Promise<ImageBase64Part> {
  if (!isSvgImageMimeType(part.mimeType)) {
    return part;
  }
  const svgBuffer = Buffer.from(part.base64, "base64");
  const pngBuffer = await sharp(svgBuffer, { density: 144 })
    .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
  return { mimeType: "image/png", base64: pngBuffer.toString("base64") };
}

function decodeDataUrlPercentEncodedPayload(payload: string): string {
  try {
    return decodeURIComponent(payload);
  } catch {
    try {
      return decodeURIComponent(payload.replace(/\+/g, " "));
    } catch {
      return payload;
    }
  }
}

/**
 * Loads image bytes as raw base64 + MIME type for Gemini `inlineData`.
 */
async function loadImageAsBase64Part(imageUrl: string): Promise<ImageBase64Part> {
  const trimmed = imageUrl.trim();
  if (trimmed.startsWith("data:")) {
    const commaIndex = trimmed.indexOf(",");
    if (commaIndex === -1) {
      throw new Error("Invalid data URL: missing payload.");
    }
    const header = trimmed.slice(5, commaIndex);
    const payload = trimmed.slice(commaIndex + 1);
    const mimeMatch = header.match(/^([^;]+)/);
    const mimeType = mimeMatch?.[1]?.trim() || "image/jpeg";
    if (header.toLowerCase().includes(";base64")) {
      return { mimeType, base64: payload };
    }
    // URL-encoded data (e.g. inline SVG as data:image/svg+xml;charset=utf-8,...): decode then re-encode as base64
    const decoded = decodeDataUrlPercentEncodedPayload(payload);
    return { mimeType, base64: Buffer.from(decoded, "utf8").toString("base64") };
  }

  const base64 = await imageToBase64(trimmed);
  const mimeType = mimeTypeFromUrlOrPath(trimmed);
  return { mimeType, base64 };
}

function stripLeadingBom(text: string): string {
  return text.replace(/^\uFEFF/, "");
}

/**
 * Detects SVG document or fragment (allows BOM, XML declaration, comments before `<svg`).
 */
function extractSvgMarkupForModel(markup: string): string | null {
  const trimmed = stripLeadingBom(markup).trim();
  const direct = /^\s*(?:<\?xml[^?]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg\b/i;
  if (direct.test(trimmed)) {
    const svgSlice = trimmed.match(/<svg[\s\S]*<\/svg>/i);
    return svgSlice ? svgSlice[0].trim() : trimmed;
  }
  const anywhere = trimmed.match(/<svg[\s\S]*<\/svg>/i);
  return anywhere ? anywhere[0].trim() : null;
}

/**
 * Context logos may be inline SVG markup, a data URL (e.g. header inline SVG), or an image URL.
 * SVG sources are rasterized to PNG before sending — the image model rejects `image/svg+xml`.
 */
async function loadLogoAsBase64Part(logo: string): Promise<ImageBase64Part> {
  const trimmed = logo.trim();
  const svgFromMarkup = extractSvgMarkupForModel(trimmed);
  let part: ImageBase64Part;
  if (svgFromMarkup) {
    part = {
      mimeType: "image/svg+xml",
      base64: Buffer.from(svgFromMarkup, "utf8").toString("base64"),
    };
  } else if (trimmed.startsWith("data:")) {
    part = await loadImageAsBase64Part(trimmed);
  } else if (/^https?:\/\//i.test(trimmed)) {
    const response = await fetch(trimmed, { redirect: "follow" });
    if (!response.ok) {
      throw new Error(`Failed to fetch logo URL (${response.status}).`);
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    const headerMime = (response.headers.get("content-type") || "").split(";")[0].trim();
    const fromPath = mimeTypeFromUrlOrPath(trimmed);
    const mimeType = headerMime.startsWith("image/")
      ? headerMime
      : fromPath.startsWith("image/")
        ? fromPath
        : trimmed.toLowerCase().includes(".svg")
          ? "image/svg+xml"
          : "image/png";
    part = { mimeType, base64: Buffer.from(bytes).toString("base64") };
  } else {
    part = await loadImageAsBase64Part(trimmed);
  }
  return rasterizeSvgPartToPng(part);
}

export const IMAGE_MODEL_PREMIUM = "gemini-3-pro-image-preview";
export const IMAGE_MODEL_FAST = "gemini-3.1-flash-image-preview";

type ImageHumanPart =
  | { type: "text"; text: string }
  | { type: "image"; source_type: "base64"; mime_type: string; data: string };

/**
 * Sends the creative brief as text-only first, then a labeled logo block (if any),
 * then labeled section blocks each followed by only that section's reference images.
 */
export async function generateImageFromPrompt(
  templatePrompt: string,
  referenceImageGroups: ReferenceImageGroup[],
  logoUrl?: string | null,
  imageModel = IMAGE_MODEL_PREMIUM,
): Promise<string> {
  const normalizedGroups = referenceImageGroups
    .map((group) => ({
      sectionTitle: group.sectionTitle.trim() || DEFAULT_SECTION_TITLE,
      imageUrls: group.imageUrls
        .map((url) => url.trim())
        .filter(Boolean)
        .filter((url) => !isSvgUrl(url)),
    }))
    .filter((group) => group.imageUrls.length > 0);

  const validLogoUrl = logoUrl?.trim() ? logoUrl.trim() : null;

  const groupsWithoutLogoDupes = validLogoUrl
    ? normalizedGroups
        .map((group) => ({
          ...group,
          imageUrls: group.imageUrls.filter((url) => url !== validLogoUrl),
        }))
        .filter((group) => group.imageUrls.length > 0)
    : normalizedGroups;

  const nonLogoReferenceCount = groupsWithoutLogoDupes.reduce(
    (total, group) => total + group.imageUrls.length,
    0,
  );

  const imageModelClient = new ChatGoogle({
    model: imageModel,
    temperature: 0.2,
  });

  const systemPromptParts = [IMAGE_MODEL_SYSTEM_PROMPT_BASE];
  if (validLogoUrl) {
    systemPromptParts.push(IMAGE_MODEL_LOGO_FIDELITY_RULES);
  }
  if (nonLogoReferenceCount > 0) {
    systemPromptParts.push(IMAGE_MODEL_REFERENCE_IMAGES_RULES);
  }
  const systemMessage = new SystemMessage(systemPromptParts.join(" "));

  const humanContent: ImageHumanPart[] = [{ type: "text", text: templatePrompt.trim() }];

  if (validLogoUrl) {
    humanContent.push({
      type: "text",
      text: LOGO_BLOCK_USER_INSTRUCTION,
    });
    const logoPart = await loadLogoAsBase64Part(validLogoUrl);
    humanContent.push({
      type: "image",
      source_type: "base64",
      mime_type: logoPart.mimeType,
      data: logoPart.base64,
    });
  }

  for (const group of groupsWithoutLogoDupes) {
    humanContent.push({
      type: "text",
      text: sectionReferenceUserInstruction(group.sectionTitle),
    });
    const sectionParts = await Promise.all(
      group.imageUrls.map((url) => loadImageAsBase64Part(url)),
    );
    for (const part of sectionParts) {
      humanContent.push({
        type: "image",
        source_type: "base64",
        mime_type: part.mimeType,
        data: part.base64,
      });
    }
  }

  const humanMessage = new HumanMessage({ content: humanContent });
  const messages = [systemMessage, humanMessage];

  const response = await imageModelClient.invoke(messages);

  const contentBlocks = (response as unknown as { contentBlocks?: unknown[] }).contentBlocks;
  const imageData =
    contentBlocks && extractImageDataFromResponse(contentBlocks);

  if (imageData) return imageData;

  throw new Error("No image was returned by the model.");
}

/** Generates an image using semantics-based reference image selection from the context. */
export async function generateImageFromPromptForContext(
  prompt: string,
  contextId: string,
  imageModel = IMAGE_MODEL_PREMIUM,
  /** When set (including `null`), skips DB read — same contract as {@link generateImageWithKnownReferences}. */
  explicitLogoUrl?: string | null,
): Promise<{ imageUrl: string; referenceImageUrls: string[] }> {
  const referenceImageGroups = await referenceImageGroupsFromPromptSemantics(prompt, contextId);
  const logoUrl =
    explicitLogoUrl !== undefined
      ? explicitLogoUrl?.trim()
        ? explicitLogoUrl.trim()
        : null
      : await getLogoUrlForContext(contextId);
  const imageUrl = await generateImageFromPrompt(
    prompt,
    referenceImageGroups,
    logoUrl,
    imageModel,
  );
  const referenceImageUrls = flattenReferenceImageUrls(referenceImageGroups);
  return { imageUrl, referenceImageUrls };
}

/**
 * Generates an image using a pre-selected list of reference URLs (from the angle
 * similarity step), bypassing the semantic search. The logo is still fetched from
 * the context and prepended automatically.
 */
export async function generateImageWithKnownReferences(
  templatePrompt: string,
  contextId: string,
  referenceImageGroups: ReferenceImageGroup[],
  imageModel = IMAGE_MODEL_PREMIUM,
): Promise<string> {
  const logoUrl = await getLogoUrlForContext(contextId);
  return generateImageFromPrompt(templatePrompt, referenceImageGroups, logoUrl, imageModel);
}

// ── AI brand analysis ─────────────────────────────────────────────────────────

const BRAND_ANALYSIS_JSON_SCHEMA = {
  type: "object",
  properties: {
    personality: {
      type: "object",
      properties: {
        tone: { type: "string", maxLength: 64 },
        energy: { type: "string", maxLength: 64 },
        audience: { type: "string", maxLength: 80 },
        voice: { type: "string", maxLength: 80 },
        archetype: { type: "string", maxLength: 48 },
        valueProposition: { type: "string", maxLength: 160 },
        emotionalTriggers: {
          type: "array",
          maxItems: 6,
          items: { type: "string", maxLength: 80 },
        },
        communicationStyle: { type: "string", maxLength: 64 },
      },
      required: ["tone", "energy", "audience", "voice", "archetype", "valueProposition", "emotionalTriggers", "communicationStyle"],
    },
    marketingAngles: {
      type: "array",
      items: { type: "string", maxLength: 140 },
    },
  },
  required: ["personality", "marketingAngles"],
} as const;

function clampPersonalityField(value: string | undefined, maxLength: number): string {
  const trimmed = (value ?? "").trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trimEnd();
}

/** Keeps personality fields short for UI and downstream prompts (legacy rows, verbose models). */
export function normalizeBrandingPersonality(
  personality: BrandingPersonality,
): BrandingPersonality {
  return {
    tone: clampPersonalityField(personality.tone, 64),
    energy: clampPersonalityField(personality.energy, 64),
    audience: clampPersonalityField(personality.audience, 80),
    voice: clampPersonalityField(personality.voice, 80),
    archetype: clampPersonalityField(personality.archetype, 48),
    valueProposition: clampPersonalityField(personality.valueProposition, 160),
    communicationStyle: clampPersonalityField(personality.communicationStyle, 64),
    emotionalTriggers: (personality.emotionalTriggers ?? [])
      .slice(0, 6)
      .map((trigger) => clampPersonalityField(trigger, 80))
      .filter((trigger) => trigger.length > 0),
  };
}

/**
 * Makes a single AI call to extract personality specs and marketing angles
 * from all scraped document text combined. Returns up to 40 distinct angles.
 */
export async function analyzePersonalityAndAngles(
  allDocumentTexts: string[],
): Promise<{ personality: BrandingPersonality; marketingAngles: string[] }> {
  const combinedText = allDocumentTexts.join("\n\n---\n\n").slice(0, 80_000);

  const modelContent = await invokeChatWithStructuredJson(
    BRAND_ANALYSIS_SYSTEM_PROMPT,
    { content: combinedText },
    BRAND_ANALYSIS_JSON_SCHEMA,
  );
  if (!modelContent) {
    return {
      personality: normalizeBrandingPersonality({
        tone: "neutral",
        energy: "moderate",
        audience: "general",
        voice: "direct",
        archetype: "Creator",
        valueProposition: "",
        emotionalTriggers: [],
        communicationStyle: "benefit-focused",
      }),
      marketingAngles: [],
    };
  }

  const parsed = JSON.parse(modelContent) as {
    personality: BrandingPersonality;
    marketingAngles: string[];
  };

  return {
    personality: normalizeBrandingPersonality(parsed.personality),
    marketingAngles: (parsed.marketingAngles ?? []).slice(0, 40),
  };
}

// ── Ad prompt generation ──────────────────────────────────────────────────────

const BATCH_AD_PROMPTS_JSON_SCHEMA = {
  type: "object",
  properties: {
    prompts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          templateId:   { type: "string" },
          headline:     { type: "string" },
          subheadline:  { type: "string" },
          description:  { type: "string" },
          primaryColor: { type: "string" },
          accentColor:  { type: "string" },
          fontStyle:    { type: "string" },
          filledPrompt: { type: "string" },
        },
        required: ["templateId", "headline", "subheadline", "description", "primaryColor", "accentColor", "fontStyle", "filledPrompt"],
      },
    },
  },
  required: ["prompts"],
} as const;

type BatchAdPromptItem = {
  templateId: string;
  templateLabel: string;
  aspectRatio: AdAspectRatio;
};

type AdPromptBatchInput = {
  brandName: string;
  baseUrl: string;
  branding: BrandingDNA | null;
  personality: BrandingPersonality | null;
  selectedSections: { heading: string | null; markdown: string }[];
  selectedAngles: string[];
};

/**
 * Generates ad creative prompts for all given templates in a single AI call.
 * Each prompt includes colors, fonts, headline, subheadline, and a complete
 * image-generation prompt tailored to the template format and marketing angle.
 */
export async function generateAllAdPromptsFromTemplates(
  input: AdPromptBatchInput,
  templates: BatchAdPromptItem[],
  referenceImageGroups: ReferenceImageGroup[],
): Promise<GeneratedAdPrompt[]> {
  if (templates.length === 0) return [];

  const modelContent = await invokeChatWithStructuredJson(
    buildBatchAdPromptsSystemPrompt(input.selectedAngles),
    {
      brandName: input.brandName,
      baseUrl: input.baseUrl,
      branding: input.branding,
      personality: input.personality,
      marketingAngles: input.selectedAngles,
      selectedSections: input.selectedSections.map(({ heading, markdown }) => ({
        heading,
        copy: markdown.slice(0, 600),
      })),
      templates: templates.map(({ templateId, templateLabel, aspectRatio }) => ({
        templateId,
        templateFormat: templateLabel,
        aspectRatio,
      })),
    },
    BATCH_AD_PROMPTS_JSON_SCHEMA,
  );
  if (!modelContent) throw new Error("Model returned no content for ad prompts.");

  const parsed = JSON.parse(modelContent) as {
    prompts: Array<{
      templateId: string;
      headline: string;
      subheadline: string;
      description: string;
      primaryColor: string;
      accentColor: string;
      fontStyle: string;
      filledPrompt: string;
    }>;
  };

  const flatReferenceUrls = flattenReferenceImageUrls(referenceImageGroups);

  return templates.map((template) => {
    const found = parsed.prompts.find((result) => result.templateId === template.templateId);
    if (!found) throw new Error(`No prompt returned for template: ${template.templateId}`);
    return {
      templateId: template.templateId,
      templateLabel: template.templateLabel,
      aspectRatio: template.aspectRatio,
      headline: found.headline,
      subheadline: found.subheadline,
      description: found.description,
      primaryColor: found.primaryColor,
      accentColor: found.accentColor || null,
      fontStyle: found.fontStyle,
      filledPrompt: `${found.filledPrompt.trim()} Generate this creative in ${template.aspectRatio} aspect ratio.`,
      referenceImageUrls: flatReferenceUrls,
      referenceImageGroups,
    };
  });
}
