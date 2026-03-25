import "server-only";

import { htmlToText } from "html-to-text";
import { marked } from "marked";
import { saasTemplateConstants } from "@/lib/saas-template-constants";
import type { ScrapeResult, ScrapedSection } from "@/types/scrape";
import type { AdCreativesSectionOption } from "@/types/ad-creatives";
import type { FilledTemplate } from "@/types/openrouter";

function markdownToPlainText(markdown: string): string {
  const html = marked.parse(markdown, { async: false });
  return htmlToText(html, {
    wordwrap: false,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
    ],
  });
}

function sectionToOption(
  section: ScrapedSection,
  id: string,
  sourceLabel: string,
): AdCreativesSectionOption | null {
  const heading = section.heading?.trim() || "Untitled section";
  const flat = markdownToPlainText(section.content).replace(/\s+/g, " ").trim();
  if (!flat) return null;
  const preview = flat.length > 160 ? `${flat.slice(0, 160).trim()}…` : flat;
  return { id, heading, preview, sourceLabel };
}

function* eachSectionWithSource(result: ScrapeResult): Generator<{
  section: ScrapedSection;
  id: string;
  sourceLabel: string;
}> {
  for (let sectionIndex = 0; sectionIndex < result.sections.length; sectionIndex++) {
    yield {
      section: result.sections[sectionIndex]!,
      id: `main:${sectionIndex}`,
      sourceLabel: "Main page",
    };
  }
  const subpages = result.subpages;
  if (!subpages) return;
  for (let subpageIndex = 0; subpageIndex < subpages.length; subpageIndex++) {
    const subpage = subpages[subpageIndex]!;
    const sourceLabel = subpage.path?.trim() || subpage.title || `Path ${subpageIndex + 1}`;
    for (let sectionIndex = 0; sectionIndex < subpage.sections.length; sectionIndex++) {
      yield {
        section: subpage.sections[sectionIndex]!,
        id: `sub:${subpageIndex}:${sectionIndex}`,
        sourceLabel,
      };
    }
  }
}

export function flattenAdCreativesSectionOptions(result: ScrapeResult): AdCreativesSectionOption[] {
  const options: AdCreativesSectionOption[] = [];
  for (const item of eachSectionWithSource(result)) {
    const option = sectionToOption(item.section, item.id, item.sourceLabel);
    if (option) options.push(option);
  }
  return options;
}

export function resolveScrapedSectionById(result: ScrapeResult, sectionId: string): ScrapedSection | null {
  if (sectionId.startsWith("main:")) {
    const sectionIndex = Number(sectionId.slice("main:".length));
    if (!Number.isInteger(sectionIndex) || sectionIndex < 0) return null;
    return result.sections[sectionIndex] ?? null;
  }

  const subMatch = /^sub:(\d+):(\d+)$/.exec(sectionId);
  if (!subMatch) return null;

  const subpageIndex = Number(subMatch[1]);
  const sectionIndex = Number(subMatch[2]);
  const subpage = result.subpages?.[subpageIndex];
  if (!subpage) return null;
  return subpage.sections[sectionIndex] ?? null;
}

export function buildAdCreativesModelContextJson(result: ScrapeResult, sectionIds: string[]): string {
  const sectionBlocks = sectionIds
    .map((sectionId) => {
      const section = resolveScrapedSectionById(result, sectionId);
      if (!section) return null;
      return { heading: section.heading, markdown: section.content };
    })
    .filter((block): block is { heading: string | null; markdown: string } => block !== null);

  return JSON.stringify(
    {
      brandName: result.name,
      baseUrl: result.baseUrl,
      primaryUrl: result.scrapedUrl,
      branding: result.branding,
      selectedSections: sectionBlocks,
    },
    null,
    2,
  );
}

export function enrichFilledTemplates(modelTemplates: FilledTemplate[]): FilledTemplate[] {
  return modelTemplates.map((template) => {
    const definition = saasTemplateConstants[template.templateIndex - 1];
    return {
      ...template,
      prompt: template.prompt || definition?.prompt || "",
      description: template.description || definition?.description || "",
      defaultAspectRatio: template.defaultAspectRatio ?? definition?.default_aspect_ratio ?? "4:5",
      needs: template.needs.length > 0 ? template.needs : definition?.needs ?? [],
    };
  });
}
