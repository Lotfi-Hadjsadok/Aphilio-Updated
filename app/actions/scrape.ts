"use server";

import { headers } from "next/headers";
import { chromium, type Page } from "playwright";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { AnyNode } from "domhandler";
import { load, type CheerioAPI, type Cheerio } from "cheerio";
import TurndownService from "turndown";

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

/** Single-line copy: collapse internal whitespace, trim ends (titles, headings, meta). */
function cleanTextLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Markdown / body text for downstream AI: strip trailing spaces per line, normalize
 * line endings, collapse runaway blank lines, trim the tail.
 */
function cleanExtractedMarkdown(markdown: string): string {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}

const ATX_HEADING_LINE_RE = /^#{1,6}\s+(.+?)(?:\s+#*)?\s*$/;

/**
 * Section HTML becomes markdown that often repeats the same title we store in `heading`.
 * Turndown sometimes splits one logical title across an ATX line and the next plain line, so
 * exact single-line match is not enough — strip leading `#` lines (prefix/suffix overlap with
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

const PAGE_GOTO_TIMEOUT_MS = 600_000;
const NETWORK_IDLE_TIMEOUT_MS = 12_000;
const POST_LOAD_SETTLE_MS = 600;

// ── Public types ────────────────────────────────────────────────────────────

export type BrandingPersonality = {
  tone: string;
  energy: string;
  audience: string;
};

export type BrandingDNA = {
  /** Top 2 most-occurring brand colors from the page (frequency-sorted). */
  colors: { primary: string | null; secondary: string | null };
  favicon: string | null;
  logo: string | null;
  ogImage: string | null;
  personality: BrandingPersonality;
  /** Top 2 most-occurring font families (by element count). */
  fonts: { primary: string | null; secondary: string | null };
  /** Font-weight summary from body + first heading, e.g. "body:400 · heading:600" */
  typography: string | null;
};

export type ScrapedSection = {
  /** First heading in the block, or <section> aria-label / title when present */
  heading: string | null;
  /** Markdown for this section only */
  content: string;
};

/** One scraped path under a site context (stored sub_context + documents). */
export type SubpageSnapshot = {
  path: string;
  title: string;
  scrapedUrl: string;
  markdown: string;
  sections: ScrapedSection[];
};

export type ScrapeResult = {
  id: string;
  baseUrl: string;
  name: string;
  scrapedUrl: string;
  markdown: string;
  sections: ScrapedSection[];
  branding: BrandingDNA | null;
  createdAt: Date;
  /** Present when more than one path was captured for this site. */
  subpages?: SubpageSnapshot[];
};

/** Lightweight row for browsing saved contexts in the UI. */
export type SavedContextSummary = {
  id: string;
  baseUrl: string;
  name: string;
  createdAt: Date;
  subcontextCount: number;
};

export type ScrapeState = {
  error?: string;
  result?: ScrapeResult;
};

/** Server action state for opening a saved context from the library. */
export type LibraryLoadState = {
  error?: string;
  result?: ScrapeResult;
};

// ── Personality heuristics (keyword sets) ──────────────────────────────────

const PROFESSIONAL_TOKENS = new Set([
  "enterprise",
  "professional",
  "solution",
  "strategy",
  "optimize",
  "leverage",
  "stakeholder",
  "robust",
  "scalable",
  "compliance",
  "governance",
  "productivity",
  "efficiency",
]);

const CASUAL_TOKENS = new Set([
  "awesome",
  "amazing",
  "love",
  "cool",
  "hey",
  "wow",
  "super",
  "fun",
  "incredible",
  "fantastic",
  "delightful",
  "simple",
  "easy",
]);

const HIGH_ENERGY_TOKENS = new Set([
  "revolutionary",
  "transform",
  "powerful",
  "blazing",
  "instant",
  "boost",
  "explosive",
  "game-changing",
  "disruptive",
  "launch",
  "unleash",
]);

const CALM_TOKENS = new Set([
  "reliable",
  "steady",
  "consistent",
  "trusted",
  "quality",
  "thoughtful",
  "measured",
  "secure",
  "dependable",
]);

const B2B_TOKENS = new Set([
  "enterprise",
  "team",
  "organization",
  "business",
  "company",
  "roi",
  "workflow",
  "integration",
  "dashboard",
  "analytics",
  "compliance",
  "saas",
  "b2b",
]);

const B2C_TOKENS = new Set([
  "personal",
  "home",
  "family",
  "everyday",
  "everyone",
  "yourself",
  "individual",
  "consumer",
  "b2c",
]);

const DEV_TOKENS = new Set([
  "api",
  "developer",
  "code",
  "open-source",
  "github",
  "sdk",
  "documentation",
  "endpoint",
  "cli",
  "npm",
  "library",
  "framework",
]);

function countTokenHits(words: string[], tokens: ReadonlySet<string>): number {
  let hits = 0;
  for (const word of words) {
    if (tokens.has(word)) hits += 1;
  }
  return hits;
}

// ── Playwright + Cheerio helpers ─────────────────────────────────────────────

async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS }).catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, POST_LOAD_SETTLE_MS));
}

function loadCleanContentRoot(fullDocumentHtml: string): { $: CheerioAPI; root: Cheerio<AnyNode> } | null {
  const $ = load(fullDocumentHtml);

  $("script, style, noscript, svg, iframe, template, link[rel=preload]").remove();

  const main = $("main").first();
  const article = $("article").first();
  const root = main.length ? main : article.length ? article : $("body");

  if (!root.length) return null;

  root.find("script, style, noscript, svg").remove();

  return { $, root };
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
  root.find("img").each((index, element) => {
    const $img = $(element);
    const key = resolveImgUrl($img, pageBaseUrl);
    if (!key) return;
    if (seen.has(key)) {
      $img.remove();
    } else {
      seen.add(key);
    }
  });
}

function firstHeadingIn($: CheerioAPI, el: AnyNode): string | null {
  const headingEl = $(el).find("h1, h2, h3, h4, h5, h6").first();
  return headingEl.length ? headingEl.text().trim() || null : null;
}

function findMinHeadingLevel($: CheerioAPI, root: Cheerio<AnyNode>): number | null {
  for (let level = 1; level <= 6; level++) {
    if (root.find(`h${level}`).length > 0) return level;
  }
  return null;
}

function splitHtmlByHeadingsAtLevel(
  $: CheerioAPI,
  root: Cheerio<AnyNode>,
  level: number
): { heading: string | null; html: string }[] {
  const inner = root.html() ?? "";
  if (!inner.trim()) return [];
  const tag = `h${level}`;
  if (root.find(tag).length === 0) {
    return [{ heading: null, html: inner }];
  }

  const parts = inner.split(new RegExp(`(?=<${tag}\\b[^>]*>)`, "i")).filter((part) => part.trim().length > 0);

  return parts.map((part) => {
    const wrap = load(`<div>${part}</div>`);
    const headingEl = wrap(tag).first();
    const heading = headingEl.length ? headingEl.text().trim() || null : null;
    return { heading, html: part.trim() };
  });
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

  const topSections = root.find("section").filter((index, element) => $(element).parents("section").length === 0);

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

function extractSectionsFromRoot($: CheerioAPI, root: Cheerio<AnyNode>): ScrapedSection[] {
  const chunks = splitIntoSectionHtmls($, root, 0);
  return chunks
    .map(({ heading, html }) => {
      const headingText = heading ? cleanTextLine(heading) : null;
      let content = turndown.turndown(html);
      content = stripLeadingAtxHeadingIfMatches(content, headingText);
      content = cleanExtractedMarkdown(content);
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
          return `## ${section.heading}\n\n${body}`;
        }
        return body;
      })
      .join("\n\n---\n\n")
  );
}

/** Drop duplicate `![alt](url)` lines by normalized URL (shared `seen` across sections). */
function dedupeMarkdownImageReferences(markdown: string, baseUrl: string, seen: Set<string>): string {
  const cleaned = markdown.replace(/!\[([^\]]*)\]\(\s*([^)]+?)\s*\)/g, (fullMatch, altText, dest) => {
    const trimmed = dest.trim().replace(/^["']|["']$/g, "");
    let key: string;
    try {
      key = new URL(trimmed, baseUrl).href;
    } catch {
      key = trimmed;
    }
    if (seen.has(key)) return "";
    seen.add(key);
    return fullMatch;
  });
  return cleanExtractedMarkdown(cleaned.replace(/\n{3,}/g, "\n\n"));
}

function analyzePersonality(markdown: string, ogDescription: string): BrandingPersonality {
  const content = `${markdown} ${ogDescription}`.toLowerCase();
  const words = content.split(/\W+/);

  const proScore = countTokenHits(words, PROFESSIONAL_TOKENS);
  const casualScore = countTokenHits(words, CASUAL_TOKENS);

  let tone = "neutral";
  if (proScore > casualScore * 1.5) tone = "professional";
  else if (casualScore > proScore * 1.5) tone = "casual";
  else if (proScore > 0 || casualScore > 0) tone = "balanced";

  const exclamations = (content.match(/!/g) || []).length;
  const highScore = exclamations + countTokenHits(words, HIGH_ENERGY_TOKENS) * 2;
  const calmScore = countTokenHits(words, CALM_TOKENS);

  let energy = "moderate";
  if (highScore > 5 || highScore > calmScore * 2) energy = "high";
  else if (calmScore > highScore * 1.5) energy = "calm";

  const b2bScore = countTokenHits(words, B2B_TOKENS);
  const b2cScore = countTokenHits(words, B2C_TOKENS);
  const devScore = countTokenHits(words, DEV_TOKENS);

  let audience = "general";
  if (devScore >= 3 && devScore >= b2bScore) audience = "developers";
  else if (b2bScore > b2cScore * 1.5) audience = "B2B";
  else if (b2cScore > b2bScore * 1.5) audience = "B2C";
  else if (b2bScore > 0 || b2cScore > 0) audience = "mixed";

  return { tone, energy, audience };
}

/** Visual + font signals from the page (personality is derived later from markdown + meta). */
type BrandingExtracted = Omit<BrandingDNA, "personality">;

/**
 * Runs in the browser context (serialized by Playwright). Keep self-contained — no outer closures.
 */
async function extractBranding(page: Page, origin: string): Promise<BrandingExtracted> {
  const raw = await page.evaluate(async (siteOrigin: string) => {
    await document.fonts.ready;

    /** Normalize any CSS color to #rrggbb; browsers often return rgb() from getComputedStyle. */
    function toHex(color: string): string | null {
      if (!color || color === "transparent" || color === "none") return null;
      const normalizedColor = color.trim().toLowerCase();
      if (normalizedColor === "rgba(0, 0, 0, 0)" || normalizedColor === "rgba(0,0,0,0)") return null;
      if (normalizedColor === "rgb(0, 0, 0)" || normalizedColor === "rgb(0,0,0)" || normalizedColor === "#000" || normalizedColor === "#000000") return null;
      if (normalizedColor === "rgb(255, 255, 255)" || normalizedColor === "rgb(255,255,255)" || normalizedColor === "#fff" || normalizedColor === "#ffffff")
        return null;

      let red = 0;
      let green = 0;
      let blue = 0;

      const hexLong = normalizedColor.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
      if (hexLong?.[1]) {
        red = parseInt(hexLong[1].slice(0, 2), 16);
        green = parseInt(hexLong[1].slice(2, 4), 16);
        blue = parseInt(hexLong[1].slice(4, 6), 16);
      } else if (/^#[0-9a-f]{3}$/i.test(normalizedColor)) {
        const shortHex = normalizedColor.slice(1);
        red = parseInt(shortHex[0]! + shortHex[0]!, 16);
        green = parseInt(shortHex[1]! + shortHex[1]!, 16);
        blue = parseInt(shortHex[2]! + shortHex[2]!, 16);
      } else {
        const rgb = normalizedColor.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (rgb) {
          red = parseInt(rgb[1]!, 10);
          green = parseInt(rgb[2]!, 10);
          blue = parseInt(rgb[3]!, 10);
        } else {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const ctx = canvas.getContext("2d");
          if (!ctx) return null;
          ctx.fillStyle = color;
          const normalized = ctx.fillStyle as string;
          const rgb2 = typeof normalized === "string" && normalized.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
          if (rgb2) {
            red = parseInt(rgb2[1]!, 10);
            green = parseInt(rgb2[2]!, 10);
            blue = parseInt(rgb2[3]!, 10);
          } else if (typeof normalized === "string" && normalized.startsWith("#") && normalized.length === 7) {
            red = parseInt(normalized.slice(1, 3), 16);
            green = parseInt(normalized.slice(3, 5), 16);
            blue = parseInt(normalized.slice(5, 7), 16);
          } else {
            return null;
          }
        }
      }

      const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
      if (brightness < 28 || brightness > 228) return null;
      const byteToHex = (value: number) => value.toString(16).padStart(2, "0");
      return `#${byteToHex(red)}${byteToHex(green)}${byteToHex(blue)}`;
    }

    function extractColorTokensFromCssText(cssText: string): string[] {
      if (!cssText || cssText === "none") return [];
      const text = cssText.trim();
      const tokens: string[] = [];

      // Common hex forms (#rgb, #rrggbb, #rrggbbaa)
      tokens.push(...(text.match(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?)\b/g) ?? []));

      // Functional colors (rgb/rgba/hsl/hsla, oklch, lab/lch, etc.)
      const functionalMatches =
        text.match(
          /(rgba?\([^)]*\)|hsla?\([^)]*\)|hwb\([^)]*\)|lab\([^)]*\)|lch\([^)]*\)|oklab\([^)]*\)|oklch\([^)]*\)|color\([^)]*\))/gi,
        ) ?? [];
      tokens.push(...functionalMatches);

      // Keywords that can appear in gradients
      tokens.push(...(text.match(/\btransparent\b/gi) ?? []));

      return [...new Set(tokens)];
    }

    const colorCounts = new Map<string, number>();
    const addColor = (cssColor: string) => {
      const hex = toHex(cssColor);
      if (hex) colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
    };

    function addGradientColors(cssBackgroundImageOrVarValue: string) {
      for (const token of extractColorTokensFromCssText(cssBackgroundImageOrVarValue)) addColor(token);
    }

    function skipSvg(el: Element): boolean {
      return Boolean(el.closest("svg"));
    }

    const rootStyle = getComputedStyle(document.documentElement);
    const tempDiv = document.createElement("div");
    document.body.appendChild(tempDiv);
    for (const prop of Array.from(rootStyle)) {
      if (!prop.startsWith("--")) continue;
      const lower = prop.toLowerCase();
      if (
        lower.includes("color") ||
        lower.includes("primary") ||
        lower.includes("secondary") ||
        lower.includes("accent") ||
        lower.includes("brand") ||
        lower.includes("bg") ||
        lower.includes("background")
      ) {
        const val = rootStyle.getPropertyValue(prop).trim();
        if (!val) continue;
        const lowerVal = val.toLowerCase();
        if (lowerVal.includes("gradient(")) {
          addGradientColors(val);
        } else {
          tempDiv.style.backgroundColor = val;
          const computed = getComputedStyle(tempDiv).backgroundColor;
          if (computed && computed !== "rgba(0, 0, 0, 0)") addColor(computed);
        }
      }
    }
    document.body.removeChild(tempDiv);

    addColor(getComputedStyle(document.documentElement).backgroundColor);
    if (document.body) {
      const bs = getComputedStyle(document.body);
      addColor(bs.backgroundColor);
      addColor(bs.color);
    }

    document
      .querySelectorAll<HTMLElement>('button, [role="button"], a[class*="btn"], a[class*="button"]')
      .forEach((el) => {
        if (skipSvg(el)) return;
        const style = getComputedStyle(el);
        addColor(style.backgroundColor);
        if (style.backgroundImage && style.backgroundImage !== "none") addGradientColors(style.backgroundImage);
        addColor(style.color);
        addColor(style.borderColor);
      });

    document.querySelectorAll<HTMLElement>("a[href]").forEach((el) => {
      if (skipSvg(el)) return;
      addColor(getComputedStyle(el).color);
    });

    document.querySelectorAll<HTMLElement>("h1, h2, h3").forEach((el) => {
      if (skipSvg(el)) return;
      addColor(getComputedStyle(el).color);
    });

    document
      .querySelectorAll<HTMLElement>('[class*="accent"], [class*="primary"], [class*="highlight"], [class*="brand"]')
      .forEach((el) => {
        if (skipSvg(el)) return;
        const style = getComputedStyle(el);
        addColor(style.color);
        addColor(style.backgroundColor);
        if (style.backgroundImage && style.backgroundImage !== "none") addGradientColors(style.backgroundImage);
      });

    const sortedHex = [...colorCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([hex]) => hex);
    const primaryColor = sortedHex[0] ?? null;
    const secondaryColor =
      sortedHex.find((hexValue, index) => index > 0 && hexValue !== primaryColor) ?? sortedHex[1] ?? null;

    function resolveUrl(src: string): string {
      if (!src) return "";
      if (src.startsWith("http") || src.startsWith("//")) return src;
      return siteOrigin + (src.startsWith("/") ? src : "/" + src);
    }

    let logoUrl: string | null = null;

    const logoImgs = document.querySelectorAll<HTMLImageElement>(
      'img[src*="logo" i], img[alt*="logo" i], img[class*="logo" i], img[id*="logo" i]'
    );
    if (logoImgs.length > 0) {
      const src = logoImgs[0].getAttribute("src");
      if (src) logoUrl = resolveUrl(src);
    }

    if (!logoUrl) {
      const navImg = document.querySelector<HTMLImageElement>('header img, nav img, [role="banner"] img');
      if (navImg) {
        const src = navImg.getAttribute("src");
        if (src) logoUrl = resolveUrl(src);
      }
    }

    let faviconUrl: string | null = null;
    const faviconSelectors = [
      'link[rel="icon"][type="image/svg+xml"]',
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
    ];
    for (const sel of faviconSelectors) {
      const el = document.querySelector<HTMLLinkElement>(sel);
      if (el?.href) {
        faviconUrl = el.href;
        break;
      }
    }
    if (!faviconUrl) faviconUrl = siteOrigin + "/favicon.ico";

    if (!logoUrl && faviconUrl && faviconUrl.endsWith(".svg")) {
      logoUrl = faviconUrl;
    }

    const ogImgEl = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    const ogImageUrl = ogImgEl?.content ?? null;

    const GENERIC_FAMILIES = new Set([
      "serif",
      "sans-serif",
      "monospace",
      "cursive",
      "fantasy",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "Helvetica",
      "Times New Roman",
      "Georgia",
    ]);

    function isGeneric(name: string): boolean {
      const trimmedName = name.trim();
      const lower = trimmedName.toLowerCase();
      return GENERIC_FAMILIES.has(trimmedName) || GENERIC_FAMILIES.has(lower);
    }

    function primaryFontFamilyFor(el: Element): string | null {
      const stack = getComputedStyle(el).fontFamily
        .split(",")
        .map((family) => family.replace(/['"]/g, "").trim())
        .filter(Boolean);
      for (const family of stack) {
        if (!isGeneric(family)) return family;
      }
      return null;
    }

    const fontCounts = new Map<string, number>();
    const nodes = document.body?.querySelectorAll("*") ?? [];
    const maxNodes = 4000;
    let nodeCount = 0;
    for (const el of nodes) {
      if (nodeCount++ >= maxNodes) break;
      const fam = primaryFontFamilyFor(el);
      if (fam) fontCounts.set(fam, (fontCounts.get(fam) || 0) + 1);
    }
    const bodyRoot = document.body;
    if (bodyRoot) {
      const bodyFont = primaryFontFamilyFor(bodyRoot);
      if (bodyFont) fontCounts.set(bodyFont, (fontCounts.get(bodyFont) || 0) + 1);
    }

    const sortedFonts = [...fontCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([name]) => name);
    const primaryFont = sortedFonts[0] ?? null;
    const secondaryFont = sortedFonts[1] ?? null;

    const bodyEl = document.body;
    const bodyW = bodyEl ? getComputedStyle(bodyEl).fontWeight : null;
    const headingEl = document.querySelector("h1, h2, h3");
    const headingW = headingEl ? getComputedStyle(headingEl).fontWeight : null;
    const typography =
      [bodyW && `body:${bodyW}`, headingW && `heading:${headingW}`].filter(Boolean).join(" · ") || null;

    return {
      primaryColor,
      secondaryColor,
      logoUrl,
      faviconUrl,
      ogImageUrl,
      primaryFont,
      secondaryFont,
      typography,
    };
  }, origin);

  return {
    colors: { primary: raw.primaryColor, secondary: raw.secondaryColor },
    favicon: raw.faviconUrl,
    logo: raw.logoUrl,
    ogImage: raw.ogImageUrl,
    fonts: { primary: raw.primaryFont, secondary: raw.secondaryFont },
    typography: raw.typography,
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
  if (!pathname || pathname === "") return "/";
  let normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (normalizedPath.length > 1 && normalizedPath.endsWith("/")) normalizedPath = normalizedPath.slice(0, -1);
  return normalizedPath;
}

function extractImageUrlsFromMarkdown(markdown: string, baseHref: string): string[] {
  const urls: string[] = [];
  const re = /!\[([^\]]*)\]\(\s*([^)]+?)\s*\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown)) !== null) {
    const dest = match[2].trim().replace(/^["']|["']$/g, "");
    try {
      urls.push(new URL(dest, baseHref).href);
    } catch {
      urls.push(dest);
    }
  }
  return [...new Set(urls)];
}

function extractVideoUrlsFromMarkdown(markdown: string, baseHref: string): string[] {
  const urls: string[] = [];
  const re = /!\[([^\]]*)\]\(\s*([^)]+?)\s*\)|\]\(\s*(https?:\/\/[^)\s]+)\s*\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown)) !== null) {
    const dest = (match[2] ?? "").trim().replace(/^["']|["']$/g, "");
    if (!dest || !/\.(mp4|webm|ogg)(\?|#|$)/i.test(dest)) continue;
    try {
      urls.push(new URL(dest, baseHref).href);
    } catch {
      urls.push(dest);
    }
  }
  return [...new Set(urls)];
}

function mergeBrandingFromRecord(record: {
  branding: unknown;
  logo: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  typography: string | null;
}): BrandingDNA | null {
  const stored = record.branding as BrandingDNA | null;
  if (!stored && !record.logo && !record.primaryColor && !record.secondaryColor && !record.typography) return null;
  return {
    colors: {
      primary: record.primaryColor ?? stored?.colors?.primary ?? null,
      secondary: record.secondaryColor ?? stored?.colors?.secondary ?? null,
    },
    favicon: stored?.favicon ?? null,
    logo: record.logo ?? stored?.logo ?? null,
    ogImage: stored?.ogImage ?? null,
    personality: stored?.personality ?? { tone: "neutral", energy: "moderate", audience: "general" },
    fonts: stored?.fonts ?? { primary: null, secondary: null },
    typography: record.typography ?? stored?.typography ?? null,
  };
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

    const prepared = loadCleanContentRoot(fullHtml);
    if (!prepared) {
      return { ok: false, error: ERR_EMPTY_CONTENT };
    }

    const { $, root } = prepared;
    dedupeImagesInRoot($, root, targetUrl.href);
    const sectionsRaw = extractSectionsFromRoot($, root);
    if (sectionsRaw.length === 0) {
      return { ok: false, error: ERR_EMPTY_CONTENT };
    }

    const imageUrlSeen = new Set<string>();
    const sections = sectionsRaw
      .map((section) => ({
        ...section,
        content: dedupeMarkdownImageReferences(section.content, targetUrl.href, imageUrlSeen),
      }))
      .filter((section) => section.content.trim().length > 0);

    if (sections.length === 0) {
      return { ok: false, error: ERR_EMPTY_CONTENT };
    }

    const markdown = combineSectionsToMarkdown(sections);

    let branding: BrandingDNA | null = null;
    if (brandingExtracted) {
      const $meta = load(fullHtml);
      const ogDescription = cleanTextLine(
        $meta('meta[property="og:description"]').attr("content") ??
          $meta('meta[name="description"]').attr("content") ??
          ""
      );
      branding = {
        ...brandingExtracted,
        personality: analyzePersonality(markdown, ogDescription),
      };
    }

    return {
      ok: true,
      data: { title, markdown, sections, branding },
    };
  } finally {
    await context.close();
    await browser.close();
  }
}

export async function scrapeWebsite(_prevState: ScrapeState, formData: FormData): Promise<ScrapeState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: ERR_UNAUTHORIZED };

  const rawUrl = formData.get("url") as string;
  const targetUrl = parseTargetUrl(rawUrl);
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
          typography: branding?.typography ?? null,
          branding: branding ?? undefined,
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

    for (const section of sections) {
      await transaction.contextDocument.create({
        data: {
          contextId: parent.id,
          subcontextId: sub.id,
          section: section.heading ?? "Content",
          content: section.content,
          images: extractImageUrlsFromMarkdown(section.content, targetUrl.href),
          videos: extractVideoUrlsFromMarkdown(section.content, targetUrl.href),
        },
      });
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
      branding: mergeBrandingFromRecord(parent),
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
  branding: unknown;
  logo: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  typography: string | null;
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
      branding: mergeBrandingFromRecord(record),
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
    branding: mergeBrandingFromRecord(record),
    createdAt: record.createdAt,
    subpages: snapshots.length > 1 ? snapshots : undefined,
  };
}

export async function listSavedContexts(): Promise<SavedContextSummary[]> {
  const session = await auth.api.getSession({ headers: await headers() });
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

export async function loadSavedContext(
  contextId: string,
): Promise<{ ok: true; result: ScrapeResult } | { ok: false; error: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
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
  const id = formData.get("contextId") as string;
  if (!id?.trim()) return { error: "Missing context." };

  const outcome = await loadSavedContext(id);
  if (!outcome.ok) return { error: outcome.error };
  return { result: outcome.result };
}

export type DeleteDNAState = {
  error?: string;
  deletedContextId?: string | null;
};

export async function deleteSavedContext(
  _prevState: DeleteDNAState,
  formData: FormData,
): Promise<DeleteDNAState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: ERR_UNAUTHORIZED };

  const contextId = formData.get("contextId") as string;
  if (!contextId?.trim()) return { error: "Missing context." };

  const deleted = await prisma.scrapedContext.deleteMany({
    where: { id: contextId, userId: session.user.id },
  });

  if (deleted.count === 0) return { error: "Context not found." };

  return { deletedContextId: contextId };
}

export async function getScrapedContexts(): Promise<ScrapeResult[]> {
  const session = await auth.api.getSession({ headers: await headers() });
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
