import type { ReferenceImageGroup, SelectedTemplate } from "@/types/ad-creatives";
import { LEGACY_FLAT_REFERENCE_SECTION_TITLE } from "@/lib/ad-creatives-constants";

export function parseJsonStringArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function parseCommaSeparatedIds(raw: string): string[] {
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function parseReferenceImageGroups(raw: string): ReferenceImageGroup[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is ReferenceImageGroup =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as ReferenceImageGroup).sectionTitle === "string" &&
          Array.isArray((item as ReferenceImageGroup).imageUrls) &&
          (item as ReferenceImageGroup).imageUrls.every(
            (url: unknown) => typeof url === "string",
          ),
      )
      .map((item) => ({
        sectionTitle: item.sectionTitle,
        imageUrls: item.imageUrls,
      }));
  } catch {
    return [];
  }
}

export function parseSelectedTemplates(raw: string): SelectedTemplate[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SelectedTemplate =>
        typeof item === "object" &&
        item !== null &&
        typeof item.templateId === "string" &&
        typeof item.templateLabel === "string" &&
        typeof item.aspectRatio === "string",
    );
  } catch {
    return [];
  }
}

export function referenceImageGroupsFromLegacyFlatUrls(urls: string[]): ReferenceImageGroup[] {
  const filtered = urls.map((url) => url.trim()).filter(Boolean);
  if (filtered.length === 0) return [];
  return [{ sectionTitle: LEGACY_FLAT_REFERENCE_SECTION_TITLE, imageUrls: filtered }];
}
