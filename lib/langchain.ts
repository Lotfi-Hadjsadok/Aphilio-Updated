import "server-only";

import imageToBase64 from "image-to-base64";
import { lookup as lookupMimeType } from "mime-types";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatGoogle } from "@langchain/google";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import prisma from "@/lib/prisma";
import { DEFAULT_SECTION_TITLE } from "@/lib/ad-creatives-constants";
import {
  BRAND_ANALYSIS_SYSTEM_PROMPT,
  buildBatchAdPromptsSystemPrompt,
  IMAGE_MODEL_LOGO_FIDELITY_RULES,
  IMAGE_MODEL_REFERENCE_IMAGES_RULES,
  IMAGE_MODEL_SYSTEM_PROMPT_BASE,
  LOGO_BLOCK_USER_INSTRUCTION,
  sectionReferenceUserInstruction,
} from "@/lib/ad-creatives-prompts";
import type { BrandingPersonality, BrandingDNA } from "@/types/scrape";
import type {
  AdAspectRatio,
  GeneratedAdPrompt,
  ReferenceImageGroup,
  SimilarDocument,
} from "@/types/ad-creatives";

export type { GeneratedAdPrompt } from "@/types/ad-creatives";

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

export async function embedTextsForContextDocuments(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const model = getEmbeddingsModel();
  return model.embedDocuments(texts);
}

function isSvgUrl(url: string): boolean {
  const lowered = url.toLowerCase();
  return (
    lowered.endsWith(".svg") ||
    lowered.includes(".svg?") ||
    lowered.startsWith("data:image/svg")
  );
}

/**
 * Builds ordered reference groups from similarity-ranked documents, capping total images.
 */
export function buildReferenceImageGroupsFromSimilarDocuments(
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
  if (!angleEmbedding || angleEmbedding.length !== EMBEDDING_MODEL_DIMENSIONS) {
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
export async function referenceImageGroupsFromPromptSemantics(
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

export async function referenceImageUrlsFromPromptSemantics(
  prompt: string,
  contextId: string,
): Promise<string[]> {
  const groups = await referenceImageGroupsFromPromptSemantics(prompt, contextId);
  return flattenReferenceImageUrls(groups);
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
    if (!header.toLowerCase().includes(";base64")) {
      throw new Error("Expected a base64 data URL for inline images.");
    }
    const mimeMatch = header.match(/^([^;]+)/);
    const mimeType = mimeMatch?.[1]?.trim() || "image/jpeg";
    return { mimeType, base64: payload };
  }

  const base64 = await imageToBase64(trimmed);
  const mimeType = mimeTypeFromUrlOrPath(trimmed);
  return { mimeType, base64 };
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

  const validLogoUrl =
    logoUrl?.trim() && !isSvgUrl(logoUrl.trim()) ? logoUrl.trim() : null;

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
    const logoPart = await loadImageAsBase64Part(validLogoUrl);
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
): Promise<{ imageUrl: string; referenceImageUrls: string[] }> {
  const [referenceImageGroups, logoUrl] = await Promise.all([
    referenceImageGroupsFromPromptSemantics(prompt, contextId),
    getLogoUrlForContext(contextId),
  ]);
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
        tone: { type: "string" },
        energy: { type: "string" },
        audience: { type: "string" },
        voice: { type: "string" },
        archetype: { type: "string" },
        valueProposition: { type: "string" },
        emotionalTriggers: { type: "array", items: { type: "string" } },
        communicationStyle: { type: "string" },
      },
      required: ["tone", "energy", "audience", "voice", "archetype", "valueProposition", "emotionalTriggers", "communicationStyle"],
    },
    marketingAngles: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["personality", "marketingAngles"],
} as const;

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
      personality: {
        tone: "neutral",
        energy: "moderate",
        audience: "general",
        voice: "direct",
        archetype: "Creator",
        valueProposition: "",
        emotionalTriggers: [],
        communicationStyle: "benefit-focused",
      },
      marketingAngles: [],
    };
  }

  const parsed = JSON.parse(modelContent) as {
    personality: BrandingPersonality;
    marketingAngles: string[];
  };

  return {
    personality: parsed.personality,
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
