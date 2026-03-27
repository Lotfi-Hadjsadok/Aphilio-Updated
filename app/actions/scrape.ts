"use server";

import { chromium, type Page } from "playwright";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import {
  embedTextsForContextDocuments,
  embeddingArrayToPgVectorLiteral,
  analyzePersonalityAndAngles,
} from "@/lib/langchain";
import type {
  BrandingDNA,
  BrandingPersonality,
  DeleteDNAState,
  LibraryLoadState,
  LoadSavedContextOutcome,
  SavedContextSummary,
  ScrapeResult,
  ScrapeState,
  ScrapedSection,
  SubpageSnapshot,
  TypographyEntry,
} from "@/types/scrape";
import type { AnyNode } from "domhandler";
import { load, type CheerioAPI, type Cheerio } from "cheerio";
import TurndownService from "turndown";
import { extractBrandingInBrowserContext } from "./scrape-branding-page-evaluate";

// ── Video URLs (HTML fragments + markdown → `contextDocumentVideo`) ───────

/** Direct video file URLs in paths (query/hash allowed). */
const VIDEO_FILE_EXT_RE = /\.(mp4|webm|ogg|ogv|mov|m4v|m3u8|mkv|avi)(\?|#|$)/i;

function isLikelyVideoEmbedUrl(trimmedUrl: string): boolean {
  if (trimmedUrl.startsWith("blob:") || trimmedUrl.startsWith("data:")) {
    return false;
  }
  try {
    const host = new URL(trimmedUrl).hostname.toLowerCase();
    if (host === "youtu.be" || host.endsWith(".youtu.be")) return true;
    if (/^(www\.)?youtube(-nocookie)?\.com$/i.test(host)) return true;
    if (host.endsWith("vimeo.com")) return true;
    if (host.endsWith("loom.com")) return true;
    if (host.endsWith("wistia.net")) return true;
    if (host.endsWith("streamable.com")) return true;
    if (host.endsWith("dailymotion.com") || host === "dai.ly") return true;
    return false;
  } catch {
    return false;
  }
}

/** URLs we normalize in HTML/markdown and persist on `contextDocumentVideo`. */
function isTrackableVideoUrl(trimmed: string): boolean {
  if (!trimmed || trimmed.startsWith("blob:") || trimmed.startsWith("data:")) return false;
  if (VIDEO_FILE_EXT_RE.test(trimmed)) return true;
  return isLikelyVideoEmbedUrl(trimmed);
}

type TurndownElement = {
  getAttribute?: (name: string) => string | null;
  getElementsByTagName?: (name: string) => ArrayLike<{ getAttribute?: (name: string) => string | null }>;
};

function markdownLinkLabelFromDomAttributes(node: unknown, defaultLabel: string): string {
  const element = node as TurndownElement;
  const raw =
    element.getAttribute?.("title")?.trim() || element.getAttribute?.("aria-label")?.trim() || defaultLabel;
  return raw.replace(/\s+/g, " ").trim() || defaultLabel;
}

function collectVideoUrlsFromVideoElement(node: unknown): string[] {
  const element = node as TurndownElement;
  const getAttribute = element.getAttribute?.bind(element);
  if (!getAttribute) return [];
  const urls: string[] = [];
  const fromVideo = getAttribute("src")?.trim();
  if (fromVideo) urls.push(fromVideo);
  const sources = element.getElementsByTagName?.("source");
  if (sources) {
    for (let index = 0; index < sources.length; index++) {
      const sourceElementSrc = sources[index]?.getAttribute?.("src")?.trim();
      if (sourceElementSrc) urls.push(sourceElementSrc);
    }
  }
  return [...new Set(urls)];
}

// ── Markdown pipeline ───────────────────────────────────────────────────────

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

turndown.addRule("stripSvg", {
  filter: (node): boolean => node.nodeName.toLowerCase() === "svg",
  replacement: () => "",
});

turndown.addRule("videoToMarkdownLink", {
  filter: "video",
  replacement(_content, node) {
    const urls = collectVideoUrlsFromVideoElement(node);
    if (urls.length === 0) return "";
    const label = markdownLinkLabelFromDomAttributes(node, "Video");
    return `${urls.map((url) => `[${label}](${url})`).join("\n\n")}\n\n`;
  },
});

turndown.addRule("iframeVideoEmbedToMarkdownLink", {
  filter(node) {
    if (node.nodeName.toLowerCase() !== "iframe") return false;
    const src = (node as TurndownElement).getAttribute?.("src")?.trim() ?? "";
    return isTrackableVideoUrl(src);
  },
  replacement(_content, node) {
    const src = (node as TurndownElement).getAttribute?.("src")?.trim() ?? "";
    if (!src) return "";
    const label = markdownLinkLabelFromDomAttributes(node, "Video embed");
    return `[${label}](${src})\n\n`;
  },
});

/** Single-line copy: collapse internal whitespace, trim ends (titles, headings, meta). */
function cleanTextLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Markdown / body text for downstream AI: no literal newlines — collapse breaks and
 * runs of spaces so scraped HTML→markdown is a single fluid line per block.
 */
function cleanExtractedMarkdown(markdown: string): string {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

const ATX_HEADING_LINE_RE = /^#{1,6}\s+(.+?)(?:\s+#*)?\s*$/;

/**
 * Section HTML becomes markdown that often repeats the same title we store in `heading`.
 * Turndown sometimes splits one logical title across an ATX line and the next plain line, so
 * exact single-line match is not enough; strip leading `#` lines (prefix/suffix overlap with
 * `heading`) and, when needed, one following plain line that completes the same title.
 */
function stripLeadingAtxHeadingIfMatches(content: string, heading: string | null): string {
  if (!heading) return content;
  const headingNorm = cleanTextLine(heading);
  if (!headingNorm) return content;

  const text = content.replace(/\r\n/g, "\n").trimStart();
  if (!text) return content;

  const lines = text.split("\n");
  let lineIndex = 0;
  let acc = "";

  while (lineIndex < lines.length) {
    const match = lines[lineIndex].match(ATX_HEADING_LINE_RE);
    if (!match) break;
    const titleLine = cleanTextLine(match[1]);
    const nextAcc = acc ? cleanTextLine(`${acc} ${titleLine}`) : titleLine;
    const overlaps =
      titleLine === headingNorm ||
      headingNorm.startsWith(titleLine) ||
      titleLine.startsWith(headingNorm) ||
      nextAcc === headingNorm;
    if (!overlaps) break;
    acc = nextAcc;
    lineIndex += 1;
    if (headingNorm === acc) {
      return cleanExtractedMarkdown(lines.slice(lineIndex).join("\n"));
    }
  }

  if (acc && headingNorm.startsWith(acc) && headingNorm !== acc) {
    const remainder = headingNorm.slice(acc.length).trim();
    if (remainder) {
      while (lineIndex < lines.length && lines[lineIndex].trim() === "") lineIndex += 1;
      if (lineIndex < lines.length && cleanTextLine(lines[lineIndex]) === cleanTextLine(remainder)) {
        lineIndex += 1;
        return cleanExtractedMarkdown(lines.slice(lineIndex).join("\n"));
      }
    }
  }

  return content;
}

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const ERR_UNAUTHORIZED = "Unauthorized";
const ERR_INVALID_URL = "Invalid URL. Please enter a valid website address.";
const ERR_EMPTY_CONTENT = "Could not retrieve any content from this URL.";
const ERR_ALREADY_SCRAPED =
  "This page is already in your library. Only new paths on a site are scraped.";
const ERR_EMBEDDING_FAILED =
  "Could not generate embeddings for scraped content. Check your OpenAI API key and try again.";

const PAGE_GOTO_TIMEOUT_MS = 600_000;
const NETWORK_IDLE_TIMEOUT_MS = 12_000;
const POST_LOAD_SETTLE_MS = 600;

// ── Playwright + Cheerio helpers ─────────────────────────────────────────────

async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS }).catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, POST_LOAD_SETTLE_MS));
}

/** Drop `<iframe>` nodes that are not video files or known embed hosts (maps, ads, etc.). */
function pruneNonVideoIframes($: CheerioAPI, pageBaseUrl: string): void {
  $("iframe").each((_index, iframeElement) => {
    const $iframe = $(iframeElement);
    const raw = $iframe.attr("src")?.trim();
    if (!raw) {
      $iframe.remove();
      return;
    }
    try {
      const absolute = new URL(raw, pageBaseUrl).href;
      if (!isTrackableVideoUrl(absolute)) $iframe.remove();
    } catch {
      $iframe.remove();
    }
  });
}

function loadCleanContentRoot(
  fullDocumentHtml: string,
  pageBaseUrl: string,
): { $: CheerioAPI; root: Cheerio<AnyNode> } | null {
  const $ = load(stripSvgElementsFromRawHtml(fullDocumentHtml));

  $("script, style, noscript, svg, template, link[rel=preload]").remove();
  pruneNonVideoIframes($, pageBaseUrl);

  const main = $("main").first();
  const article = $("article").first();
  const root = main.length ? main : article.length ? article : $("body");

  if (!root.length) return null;

  root.find("script, style, noscript, svg").remove();

  return { $, root };
}

/**
 * Strip `<svg>…</svg>` blocks from raw HTML before Cheerio parsing.
 * Prevents htmlparser2 from mis-nesting subsequent siblings inside foreign-content SVG nodes,
 * which would cause them to be silently removed when we later call `$("svg").remove()`.
 */
const SVG_ELEMENT_RE = /<svg\b[^>]*>[\s\S]*?<\/svg>/gi;

function stripSvgElementsFromRawHtml(html: string): string {
  return html.replace(SVG_ELEMENT_RE, "");
}

/** Normalize img URL for deduping (absolute when possible). */
function resolveImgUrl($img: Cheerio<AnyNode>, baseUrl: string): string | null {
  const raw =
    $img.attr("src")?.trim() ||
    $img.attr("data-src")?.trim() ||
    $img.attr("data-lazy-src")?.trim() ||
    "";
  if (raw) {
    try {
      return new URL(raw, baseUrl).href;
    } catch {
      return raw;
    }
  }
  const srcset = $img.attr("srcset")?.trim();
  if (srcset) {
    const first = srcset.split(",")[0]?.trim().split(/\s+/)[0];
    if (first) {
      try {
        return new URL(first, baseUrl).href;
      } catch {
        return first;
      }
    }
  }
  return null;
}

/** Remove duplicate <img> nodes (same resource); keeps first occurrence in document order. */
function dedupeImagesInRoot($: CheerioAPI, root: Cheerio<AnyNode>, pageBaseUrl: string): void {
  const seen = new Set<string>();
  root.find("img").each((_imageIndex, imageElement) => {
    const $img = $(imageElement);
    const key = resolveImgUrl($img, pageBaseUrl);
    if (!key) return;
    if (seen.has(key)) {
      $img.remove();
    } else {
      seen.add(key);
    }
  });
}

/** Rewrite `src` / `href` in a section HTML fragment so Turndown emits absolute URLs. */
function absolutizeImgAndMediaInHtml(htmlFragment: string, pageBaseUrl: string): string {
  const trimmed = htmlFragment.trim();
  if (!trimmed) return htmlFragment;

  const wrapped = `<div id="scrape-media-root">${htmlFragment}</div>`;
  const $fragment = load(wrapped);
  const root = $fragment("#scrape-media-root");

  root.find("img").each((_index, imageElement) => {
    const $img = $fragment(imageElement);
    const absolute = resolveImgUrl($img, pageBaseUrl);
    if (absolute) $img.attr("src", absolute);
  });

  root.find("video, source").each((_index, element) => {
    const $node = $fragment(element);
    const raw = $node.attr("src")?.trim();
    if (!raw) return;
    try {
      $node.attr("src", new URL(raw, pageBaseUrl).href);
    } catch {
      /* keep original */
    }
  });

  root.find("iframe[src]").each((_index, iframeElement) => {
    const $iframe = $fragment(iframeElement);
    const raw = $iframe.attr("src")?.trim();
    if (!raw) return;
    try {
      $iframe.attr("src", new URL(raw, pageBaseUrl).href);
    } catch {
      /* keep original */
    }
  });

  root.find("a[href]").each((_index, anchorElement) => {
    const $anchor = $fragment(anchorElement);
    const href = $anchor.attr("href")?.trim();
    if (!href) return;
    try {
      const absolute = new URL(href, pageBaseUrl).href;
      if (!isTrackableVideoUrl(absolute)) return;
      $anchor.attr("href", absolute);
    } catch {
      /* keep original */
    }
  });

  return root.html() ?? htmlFragment;
}

/** Semantic headings: native levels plus ARIA headings (e.g. custom components). */
const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6, [role="heading"]';

function headingLevelOf($: CheerioAPI, element: AnyNode): number | null {
  const tagName = $(element).prop("tagName") as string | undefined;
  if (tagName && /^H[1-6]$/i.test(tagName)) {
    return Number.parseInt(tagName.charAt(1), 10);
  }
  if ($(element).attr("role") === "heading") {
    const ariaLevel = $(element).attr("aria-level");
    if (ariaLevel) {
      const parsed = Number.parseInt(ariaLevel, 10);
      if (parsed >= 1 && parsed <= 6) return parsed;
    }
    return 2;
  }
  return null;
}

function firstHeadingIn($: CheerioAPI, el: AnyNode): string | null {
  const $el = $(el);
  if ($el.is(HEADING_SELECTOR)) {
    const direct = $el.text().trim();
    if (direct) return direct;
  }
  const headingEl = $el.find(HEADING_SELECTOR).first();
  return headingEl.length ? headingEl.text().trim() || null : null;
}

function findMinHeadingLevel($: CheerioAPI, root: Cheerio<AnyNode>): number | null {
  const candidates = root.find(HEADING_SELECTOR).toArray();
  let minLevel: number | null = null;
  for (const element of candidates) {
    const level = headingLevelOf($, element);
    if (level === null) continue;
    minLevel = minLevel === null ? level : Math.min(minLevel, level);
  }
  return minLevel;
}

/** Remove nodes that appear before `marker` in document order (marker stays). */
function removePrecedingSiblingsInDocumentOrder(
  $: CheerioAPI,
  root: Cheerio<AnyNode>,
  marker: AnyNode,
) {
  let current: Cheerio<AnyNode> = $(marker);
  for (;;) {
    current.prevAll().remove();
    const parent = current.parent();
    if (!parent.length) break;
    if (parent[0] === root[0]) break;
    current = parent;
  }
}

/** Remove nodes that appear after `marker` in document order (marker stays). */
function removeFollowingInDocumentOrder(
  $: CheerioAPI,
  root: Cheerio<AnyNode>,
  marker: AnyNode,
) {
  let current: Cheerio<AnyNode> = $(marker);
  for (;;) {
    current.nextAll().remove();
    const parent = current.parent();
    if (!parent.length) break;
    if (parent[0] === root[0]) break;
    current = parent;
  }
}

/** Remove `marker` and everything that follows it in document order (within `root`). */
function removeInclusiveAndFollowingInDocumentOrder(
  $: CheerioAPI,
  root: Cheerio<AnyNode>,
  marker: AnyNode,
) {
  removeFollowingInDocumentOrder($, root, marker);
  $(marker).remove();
}

function sliceHtmlByHeadingIndices(
  $: CheerioAPI,
  root: Cheerio<AnyNode>,
  headingsAtLevel: AnyNode[],
  startIndex: number | null,
  endIndexExclusive: number | null,
): string {
  const htmlString = root.html() ?? "";
  if (!htmlString.trim()) return "";
  if (headingsAtLevel.length === 0) return htmlString;

  const outlineLevel = headingLevelOf($, headingsAtLevel[0]);
  if (outlineLevel === null) return htmlString;

  const $clone = load(`<div id="scrape-slice-root">${htmlString}</div>`);
  const cloneRoot = $clone("#scrape-slice-root");

  const cloneHeadings = cloneRoot
    .find(HEADING_SELECTOR)
    .toArray()
    .filter((element) => headingLevelOf($clone, element) === outlineLevel);

  if (cloneHeadings.length !== headingsAtLevel.length) {
    return htmlString;
  }

  if (startIndex === null && endIndexExclusive !== null) {
    const endClone = cloneHeadings[endIndexExclusive];
    removeInclusiveAndFollowingInDocumentOrder($clone, cloneRoot, endClone);
    return cloneRoot.html() ?? "";
  }

  if (startIndex !== null) {
    removePrecedingSiblingsInDocumentOrder($clone, cloneRoot, cloneHeadings[startIndex]);
  }

  if (endIndexExclusive !== null) {
    removeInclusiveAndFollowingInDocumentOrder($clone, cloneRoot, cloneHeadings[endIndexExclusive]);
  }

  return cloneRoot.html() ?? "";
}

function splitHtmlByHeadingsAtLevel(
  $: CheerioAPI,
  root: Cheerio<AnyNode>,
  level: number
): { heading: string | null; html: string }[] {
  const inner = root.html() ?? "";
  if (!inner.trim()) return [];

  const headingsAtLevel = root
    .find(HEADING_SELECTOR)
    .toArray()
    .filter((element) => headingLevelOf($, element) === level);

  if (headingsAtLevel.length === 0) {
    return [{ heading: null, html: inner }];
  }

  const parts: { heading: string | null; html: string }[] = [];

  const introHtml = sliceHtmlByHeadingIndices($, root, headingsAtLevel, null, 0);
  if (introHtml.trim()) {
    parts.push({ heading: null, html: introHtml });
  }

  for (let index = 0; index < headingsAtLevel.length; index++) {
    const start = headingsAtLevel[index];
    const endIndexExclusive = index + 1 < headingsAtLevel.length ? index + 1 : null;
    const chunkHtml = sliceHtmlByHeadingIndices($, root, headingsAtLevel, index, endIndexExclusive);
    if (chunkHtml.trim()) {
      const headingText = $(start).text().trim() || null;
      parts.push({ heading: headingText, html: chunkHtml });
    }
  }

  return parts;
}

const MAX_SECTION_NEST_DEPTH = 10;

function splitIntoSectionHtmls(
  $: CheerioAPI,
  root: Cheerio<AnyNode>,
  depth: number
): { heading: string | null; html: string }[] {
  if (depth > MAX_SECTION_NEST_DEPTH) {
    return [{ heading: null, html: root.html() ?? "" }];
  }

  const topSections = root
    .find("section")
    .filter((_sectionIndex, sectionElement) => $(sectionElement).parents("section").length === 0);

  if (topSections.length >= 2) {
    return topSections
      .toArray()
      .map((el) => {
        const heading =
          firstHeadingIn($, el) ||
          $(el).attr("aria-label")?.trim() ||
          $(el).attr("title")?.trim() ||
          null;
        return {
          heading,
          html: $(el).html() ?? "",
        };
      })
      .filter((chunk) => chunk.html.trim().length > 0);
  }

  if (topSections.length === 1) {
    return splitIntoSectionHtmls($, topSections.first(), depth + 1);
  }

  const level = findMinHeadingLevel($, root);
  if (level === null) {
    const html = root.html() ?? "";
    return html.trim() ? [{ heading: null, html }] : [];
  }

  return splitHtmlByHeadingsAtLevel($, root, level);
}

/** Extract image URLs directly from an HTML fragment via Cheerio (fallback for Turndown misses). */
function extractImageUrlsFromHtmlFragment(htmlFragment: string, baseUrl: string): string[] {
  const $frag = load(`<div id="img-extract-root">${htmlFragment}</div>`);
  const urls: string[] = [];
  $frag("#img-extract-root")
    .find("img")
    .each((_index, element) => {
      const resolved = resolveImgUrl($frag(element), baseUrl);
      if (resolved) urls.push(resolved);
    });
  return [...new Set(urls)];
}

function extractSectionsFromRoot(
  $: CheerioAPI,
  root: Cheerio<AnyNode>,
  pageBaseUrl: string,
): ScrapedSection[] {
  const chunks = splitIntoSectionHtmls($, root, 0);
  return chunks
    .map(({ heading, html }) => {
      const headingText = heading ? cleanTextLine(heading) : null;
      const htmlWithAbsoluteMedia = absolutizeImgAndMediaInHtml(html, pageBaseUrl);
      const htmlImageUrls = extractImageUrlsFromHtmlFragment(htmlWithAbsoluteMedia, pageBaseUrl);
      let content = turndown.turndown(htmlWithAbsoluteMedia);
      content = stripLeadingAtxHeadingIfMatches(content, headingText);
      content = cleanExtractedMarkdown(content);

      const markdownImageUrls = new Set(extractImageUrlsFromMarkdown(content, pageBaseUrl));
      const missingImages = htmlImageUrls.filter((url) => !markdownImageUrls.has(url));
      if (missingImages.length > 0) {
        const appendix = missingImages
          .map((url) => `![](${wrapMarkdownLinkDestination(url)})`)
          .join(" ");
        content = content ? `${content} ${appendix}` : appendix;
      }

      return { heading: headingText, content };
    })
    .filter((section) => section.content.length > 0);
}

function combineSectionsToMarkdown(sections: ScrapedSection[]): string {
  return cleanExtractedMarkdown(
    sections
      .map((section) => {
        const body = cleanExtractedMarkdown(section.content);
        if (section.heading) {
          return `## ${section.heading} ${body}`;
        }
        return body;
      })
      .join(" --- ")
  );
}

/** Wrap link destination when markdown would break on spaces or `)` inside the URL. */
function wrapMarkdownLinkDestination(absoluteUrl: string): string {
  if (/[\s<>]/.test(absoluteUrl) || absoluteUrl.includes(")")) {
    return `<${absoluteUrl}>`;
  }
  return absoluteUrl;
}

function resolveUrlAgainstBase(trimmedDest: string, baseUrl: string): { key: string; href: string } {
  try {
    const resolved = new URL(trimmedDest, baseUrl);
    return { key: resolved.href, href: resolved.href };
  } catch {
    return { key: trimmedDest, href: trimmedDest };
  }
}

/** Dedupe `![alt](url)` by normalized URL and rewrite destinations to absolute URLs (shared `seen`). */
function dedupeMarkdownImageReferences(markdown: string, baseUrl: string, seen: Set<string>): string {
  const cleaned = markdown.replace(/!\[([^\]]*)\]\(\s*([^)]+?)\s*\)/g, (_full, altText, dest) => {
    let trimmed = dest.trim().replace(/^["']|["']$/g, "");
    if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
      trimmed = trimmed.slice(1, -1).trim();
    }
    const { key, href } = resolveUrlAgainstBase(trimmed, baseUrl);
    if (seen.has(key)) return "";
    seen.add(key);
    return `![${altText}](${wrapMarkdownLinkDestination(href)})`;
  });
  return cleanExtractedMarkdown(cleaned.replace(/\n{3,}/g, "\n\n"));
}

/** Resolve relative `[label](url)` video links to absolute (not `![image](...)`). */
function absolutizeMarkdownVideoLinks(markdown: string, baseUrl: string): string {
  return markdown.replace(/(?<!!)\[([^\]]*)\]\(\s*([^)]+?)\s*\)/g, (fullMatch, label, dest) => {
    let trimmed = dest.trim().replace(/^["']|["']$/g, "");
    if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
      trimmed = trimmed.slice(1, -1).trim();
    }
    if (!isTrackableVideoUrl(trimmed)) return fullMatch;
    const { href } = resolveUrlAgainstBase(trimmed, baseUrl);
    return `[${label}](${wrapMarkdownLinkDestination(href)})`;
  });
}

async function extractBranding(page: Page, origin: string): Promise<BrandingDNA> {
  const raw = await page.evaluate(extractBrandingInBrowserContext, origin);
  return {
    colors: { primary: raw.primaryColor, secondary: raw.secondaryColor },
    favicon: raw.faviconUrl,
    logo: raw.logoUrl,
    ogImage: raw.ogImageUrl,
    typography: raw.typography.length > 0 ? raw.typography : null,
  };
}

function parseTargetUrl(raw: string): URL | null {
  try {
    return new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }
}

/** Stable hostname for dedupe: lowercase, www. stripped */
function normalizeHostname(hostname: string): string {
  const lowerHost = hostname.toLowerCase();
  return lowerHost.startsWith("www.") ? lowerHost.slice(4) : lowerHost;
}

/** Stable path for dedupe: leading slash, no trailing slash except root */
function normalizePath(pathname: string): string {
  if (!pathname) return "/";
  let normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (normalizedPath.length > 1 && normalizedPath.endsWith("/")) normalizedPath = normalizedPath.slice(0, -1);
  return normalizedPath;
}

function stripMarkdownLinkDestination(raw: string): string {
  let trimmed = raw.trim().replace(/^["']|["']$/g, "");
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

const MD_IMAGE_LINK_RE = /!\[([^\]]*)\]\(\s*([^)]+?)\s*\)/g;
const MD_PLAIN_LINK_RE = /(?<!!)\[([^\]]*)\]\(\s*([^)]+?)\s*\)/g;

function forEachMarkdownImageDestination(markdown: string, visit: (rawDestination: string) => void) {
  const expression = new RegExp(MD_IMAGE_LINK_RE.source, MD_IMAGE_LINK_RE.flags);
  let match: RegExpExecArray | null;
  while ((match = expression.exec(markdown)) !== null) {
    visit(match[2]);
  }
}

function forEachMarkdownPlainLinkDestination(markdown: string, visit: (rawDestination: string) => void) {
  const expression = new RegExp(MD_PLAIN_LINK_RE.source, MD_PLAIN_LINK_RE.flags);
  let match: RegExpExecArray | null;
  while ((match = expression.exec(markdown)) !== null) {
    visit(match[2]);
  }
}

function extractImageUrlsFromMarkdown(markdown: string, baseHref: string): string[] {
  const urls: string[] = [];
  forEachMarkdownImageDestination(markdown, (rawDestination) => {
    const trimmed = stripMarkdownLinkDestination(rawDestination);
    const { href } = resolveUrlAgainstBase(trimmed, baseHref);
    urls.push(href);
  });
  return [...new Set(urls)];
}

function extractVideoUrlsFromMarkdown(markdown: string, baseHref: string): string[] {
  const urls: string[] = [];

  const pushIfVideo = (rawDestination: string) => {
    const trimmed = stripMarkdownLinkDestination(rawDestination);
    if (!isTrackableVideoUrl(trimmed)) return;
    const { href } = resolveUrlAgainstBase(trimmed, baseHref);
    urls.push(href);
  };

  forEachMarkdownImageDestination(markdown, pushIfVideo);
  forEachMarkdownPlainLinkDestination(markdown, pushIfVideo);

  return [...new Set(urls)];
}

function brandingFromRecord(record: {
  logo: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  typography: unknown;
}): BrandingDNA | null {
  if (!record.logo && !record.primaryColor && !record.secondaryColor && !record.typography) return null;
  return {
    colors: {
      primary: record.primaryColor ?? null,
      secondary: record.secondaryColor ?? null,
    },
    favicon: null,
    logo: record.logo ?? null,
    ogImage: null,
    typography: Array.isArray(record.typography) ? (record.typography as TypographyEntry[]) : null,
  };
}

function personalityFromRecord(record: { personality: unknown }): BrandingPersonality | null {
  if (!record.personality || typeof record.personality !== "object") return null;
  return record.personality as BrandingPersonality;
}

function marketingAnglesFromRecord(record: { marketingAngles: unknown }): string[] | null {
  if (!Array.isArray(record.marketingAngles)) return null;
  return record.marketingAngles as string[];
}

type BuiltSections = {
  title: string;
  markdown: string;
  sections: ScrapedSection[];
  branding: BrandingDNA | null;
};

/**
 * Opens a page, loads DOM, extracts branding + sectioned markdown. Caller owns lifecycle if needed;
 * this function always closes its page before returning.
 */
async function buildScrapedContent(targetUrl: URL): Promise<{ ok: true; data: BuiltSections } | { ok: false; error: string }> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: BROWSER_USER_AGENT });

  try {
    const page = await context.newPage();
    const response = await page.goto(targetUrl.href, {
      waitUntil: "load",
      timeout: PAGE_GOTO_TIMEOUT_MS,
    });
    const status = response?.status() ?? 0;
    if (status >= 400) {
      return { ok: false, error: `The page returned status ${status}.` };
    }

    await waitForPageReady(page);

    const title = cleanTextLine(await page.title());
    const fullHtml = await page.content();
    const brandingExtracted = await extractBranding(page, targetUrl.origin).catch(() => null);
    await page.close();

    const prepared = loadCleanContentRoot(fullHtml, targetUrl.href);
    if (!prepared) {
      return { ok: false, error: ERR_EMPTY_CONTENT };
    }

    const { $, root } = prepared;
    dedupeImagesInRoot($, root, targetUrl.href);
    const sectionsRaw = extractSectionsFromRoot($, root, targetUrl.href);
    if (sectionsRaw.length === 0) {
      return { ok: false, error: ERR_EMPTY_CONTENT };
    }

    const imageUrlSeen = new Set<string>();
    const sections = sectionsRaw
      .map((section) => ({
        ...section,
        content: absolutizeMarkdownVideoLinks(
          dedupeMarkdownImageReferences(section.content, targetUrl.href, imageUrlSeen),
          targetUrl.href,
        ),
      }))
      .filter((section) => section.content.trim().length > 0);

    if (sections.length === 0) {
      return { ok: false, error: ERR_EMPTY_CONTENT };
    }

    const markdown = combineSectionsToMarkdown(sections);

    return {
      ok: true,
      data: { title, markdown, sections, branding: brandingExtracted },
    };
  } finally {
    await context.close();
    await browser.close();
  }
}

function textForContextDocumentEmbedding(section: ScrapedSection): string {
  const sectionLabel = section.heading ?? "Content";
  return `${sectionLabel}\n\n${section.content}`.trim();
}

export async function scrapeWebsite(_prevState: ScrapeState, formData: FormData): Promise<ScrapeState> {
  const session = await getServerSession();
  if (!session) return { error: ERR_UNAUTHORIZED };

  const targetUrl = parseTargetUrl(String(formData.get("url") ?? ""));
  if (!targetUrl) return { error: ERR_INVALID_URL };

  const baseUrl = normalizeHostname(targetUrl.hostname);
  const path = normalizePath(targetUrl.pathname);

  const existingContext = await prisma.scrapedContext.findUnique({
    where: { userId_baseUrl: { userId: session.user.id, baseUrl } },
  });

  if (existingContext) {
    const subExists = await prisma.subContext.findUnique({
      where: { contextId_path: { contextId: existingContext.id, path } },
    });
    if (subExists) return { error: ERR_ALREADY_SCRAPED };
  }

  const built = await buildScrapedContent(targetUrl);
  if (!built.ok) return { error: built.error };

  const { title, markdown, sections, branding } = built.data;
  const name = title || baseUrl;

  let sectionEmbeddings: number[][];
  try {
    sectionEmbeddings = await embedTextsForContextDocuments(
      sections.map((section) => textForContextDocumentEmbedding(section)),
    );
  } catch {
    return { error: ERR_EMBEDDING_FAILED };
  }

  // Single AI call: personality + marketing angles from all document texts
  const allDocumentTexts = sections.map((section) => textForContextDocumentEmbedding(section));
  const { personality, marketingAngles } = await analyzePersonalityAndAngles(allDocumentTexts).catch(() => ({
    personality: null as BrandingPersonality | null,
    marketingAngles: [] as string[],
  }));

  const { parent } = await prisma.$transaction(async (transaction) => {
    let parent = existingContext;

    if (!parent) {
      parent = await transaction.scrapedContext.create({
        data: {
          userId: session.user.id,
          baseUrl,
          name,
          logo: branding?.logo ?? null,
          primaryColor: branding?.colors.primary ?? null,
          secondaryColor: branding?.colors.secondary ?? null,
          typography: branding?.typography ? (branding.typography as object[]) : undefined,
          personality: personality ? (personality as object) : undefined,
          marketingAngles: marketingAngles.length > 0 ? marketingAngles : undefined,
        },
      });
    }

    const sub = await transaction.subContext.create({
      data: {
        contextId: parent.id,
        path,
        title: title || baseUrl,
      },
    });

    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
      const section = sections[sectionIndex]!;
      const imageUrls = extractImageUrlsFromMarkdown(section.content, targetUrl.href);
      const videoUrls = extractVideoUrlsFromMarkdown(section.content, targetUrl.href);
      const embeddingVector = sectionEmbeddings[sectionIndex]!;

      const createdDocument = await transaction.contextDocument.create({
        data: {
          contextId: parent.id,
          subcontextId: sub.id,
          section: section.heading ?? "Content",
          content: section.content,
          embedding: embeddingVector,
          ...(imageUrls.length > 0 && {
            documentImages: {
              create: imageUrls.map((url, sortOrder) => ({ url, sortOrder })),
            },
          }),
          ...(videoUrls.length > 0 && {
            documentVideos: {
              create: videoUrls.map((url, sortOrder) => ({ url, sortOrder })),
            },
          }),
        },
      });

      await transaction.$executeRawUnsafe(
        `UPDATE "context_document" SET "embedding_vector" = $1::vector WHERE "id" = $2`,
        embeddingArrayToPgVectorLiteral(embeddingVector),
        createdDocument.id,
      );
    }

    return { parent };
  });

  return {
    result: {
      id: parent.id,
      baseUrl,
      name: parent.name,
      scrapedUrl: targetUrl.href,
      markdown,
      sections,
      branding: brandingFromRecord(parent),
      personality: personalityFromRecord(parent),
      marketingAngles: marketingAnglesFromRecord(parent),
      createdAt: new Date(),
    },
  };
}

function documentsToSections(
  documents: { section: string; content: string }[],
): ScrapedSection[] {
  return documents.map((document) => {
    const heading = document.section === "Content" ? null : cleanTextLine(document.section);
    const content = stripLeadingAtxHeadingIfMatches(cleanExtractedMarkdown(document.content), heading);
    return { heading, content };
  });
}

function subcontextToSnapshot(
  sub: { path: string; title: string; documents: { section: string; content: string }[] },
  baseUrl: string,
): SubpageSnapshot {
  const docSections = documentsToSections(sub.documents);
  const markdown = combineSectionsToMarkdown(docSections);
  const path = sub.path;
  const scrapedUrl = `https://${baseUrl}${path === "/" ? "/" : path}`;
  return {
    path,
    title: sub.title,
    scrapedUrl,
    markdown,
    sections: docSections,
  };
}

function recordToScrapeResult(record: {
  id: string;
  baseUrl: string;
  name: string;
  createdAt: Date;
  logo: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  typography: unknown;
  personality: unknown;
  marketingAngles: unknown;
  subcontexts: {
    path: string;
    title: string;
    documents: { section: string; content: string }[];
  }[];
}): ScrapeResult {
  const snapshots = record.subcontexts.map((sub) => subcontextToSnapshot(sub, record.baseUrl));
  if (snapshots.length === 0) {
    return {
      id: record.id,
      baseUrl: record.baseUrl,
      name: record.name,
      scrapedUrl: `https://${record.baseUrl}/`,
      markdown: "",
      sections: [],
      branding: brandingFromRecord(record),
      personality: personalityFromRecord(record),
      marketingAngles: marketingAnglesFromRecord(record),
      createdAt: record.createdAt,
    };
  }
  const first = snapshots[0]!;
  return {
    id: record.id,
    baseUrl: record.baseUrl,
    name: record.name,
    scrapedUrl: first.scrapedUrl,
    markdown: first.markdown,
    sections: first.sections,
    branding: brandingFromRecord(record),
    personality: personalityFromRecord(record),
    marketingAngles: marketingAnglesFromRecord(record),
    createdAt: record.createdAt,
    subpages: snapshots.length > 1 ? snapshots : undefined,
  };
}

export async function listSavedContexts(): Promise<SavedContextSummary[]> {
  const session = await getServerSession();
  if (!session) return [];

  const rows = await prisma.scrapedContext.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      baseUrl: true,
      name: true,
      createdAt: true,
      _count: { select: { subcontexts: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    baseUrl: row.baseUrl,
    name: row.name,
    createdAt: row.createdAt,
    subcontextCount: row._count.subcontexts,
  }));
}

export async function loadSavedContext(contextId: string): Promise<LoadSavedContextOutcome> {
  const session = await getServerSession();
  if (!session) return { ok: false, error: ERR_UNAUTHORIZED };

  const contextRecord = await prisma.scrapedContext.findFirst({
    where: { id: contextId, userId: session.user.id },
    include: {
      subcontexts: {
        orderBy: { path: "asc" },
        include: { documents: { orderBy: { id: "asc" } } },
      },
    },
  });

  if (!contextRecord) return { ok: false, error: "Context not found." };

  return { ok: true, result: recordToScrapeResult(contextRecord) };
}

export async function loadContextFromLibrary(
  _prev: LibraryLoadState,
  formData: FormData,
): Promise<LibraryLoadState> {
  const id = String(formData.get("contextId") ?? "");
  if (!id.trim()) return { error: "Missing context." };

  const outcome = await loadSavedContext(id);
  if (!outcome.ok) return { error: outcome.error };
  return { result: outcome.result };
}

export async function deleteSavedContext(
  _prevState: DeleteDNAState,
  formData: FormData,
): Promise<DeleteDNAState> {
  const session = await getServerSession();
  if (!session) return { error: ERR_UNAUTHORIZED };

  const contextId = String(formData.get("contextId") ?? "");
  if (!contextId.trim()) return { error: "Missing context." };

  const deleted = await prisma.scrapedContext.deleteMany({
    where: { id: contextId, userId: session.user.id },
  });

  if (deleted.count === 0) return { error: "Context not found." };

  return { deletedContextId: contextId };
}

export async function getScrapedContexts(): Promise<ScrapeResult[]> {
  const session = await getServerSession();
  if (!session) return [];

  const records = await prisma.scrapedContext.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      subcontexts: {
        orderBy: { path: "asc" },
        include: { documents: { orderBy: { id: "asc" } } },
      },
    },
  });

  return records.map((record) => recordToScrapeResult(record));
}
