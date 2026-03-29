import type { BrandingDNA } from "@/types/scrape";

export function resolveBrandColors(branding: BrandingDNA): {
  primary: string | null;
  secondary: string | null;
} {
  const colors = branding.colors as unknown;
  if (Array.isArray(colors)) {
    return { primary: colors[0] ?? null, secondary: colors[1] ?? null };
  }
  const colorsObject = colors as {
    primary?: string | null;
    secondary?: string | null;
  };
  return {
    primary: colorsObject.primary ?? null,
    secondary: colorsObject.secondary ?? null,
  };
}

export function getReadableTextColor(backgroundHex: string): string {
  const normalizedHex = backgroundHex.startsWith("#")
    ? backgroundHex.slice(1)
    : backgroundHex;
  const expandedHex =
    normalizedHex.length === 3
      ? normalizedHex
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalizedHex;

  if (expandedHex.length !== 6) return "#FFFFFF";

  const red = Number.parseInt(expandedHex.slice(0, 2), 16) / 255;
  const green = Number.parseInt(expandedHex.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(expandedHex.slice(4, 6), 16) / 255;

  const linearize = (component: number) => {
    return component <= 0.03928
      ? component / 12.92
      : ((component + 0.055) / 1.055) ** 2.4;
  };

  const relativeLuminance =
    0.2126 * linearize(red) +
    0.7152 * linearize(green) +
    0.0722 * linearize(blue);

  return relativeLuminance > 0.6 ? "#0B0F19" : "#FFFFFF";
}
