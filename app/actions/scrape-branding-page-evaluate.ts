import type { BrandingPageEvaluatePayload } from "@/types/branding-evaluate";

/**
 * Runs inside Chromium via Playwright `page.evaluate`. Serialized as a single function;
 * must not import runtime values from app code. `import type` is erased and safe.
 */
export async function extractBrandingInBrowserContext(
  siteOrigin: string,
): Promise<BrandingPageEvaluatePayload> {
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
        const cssColorFunctionMatch = normalizedColor.match(/^color\(\s*([a-z0-9-]+)\s+([^)]+)\)$/i);
        if (cssColorFunctionMatch) {
          const channelText = cssColorFunctionMatch[2]!.split("/")[0]!.trim();
          const channelTokens = channelText.split(/\s+/).filter(Boolean);
          if (channelTokens.length >= 3) {
            const parseChannel = (channelToken: string): number | null => {
              if (channelToken.endsWith("%")) {
                const percentValue = Number.parseFloat(channelToken.slice(0, -1));
                if (!Number.isFinite(percentValue)) return null;
                const normalizedPercent = Math.max(0, Math.min(100, percentValue));
                return Math.round((normalizedPercent / 100) * 255);
              }

              const numericValue = Number.parseFloat(channelToken);
              if (!Number.isFinite(numericValue)) return null;
              if (numericValue <= 1) {
                const normalizedUnit = Math.max(0, Math.min(1, numericValue));
                return Math.round(normalizedUnit * 255);
              }

              const normalizedByte = Math.max(0, Math.min(255, numericValue));
              return Math.round(normalizedByte);
            };

            const parsedRed = parseChannel(channelTokens[0]!);
            const parsedGreen = parseChannel(channelTokens[1]!);
            const parsedBlue = parseChannel(channelTokens[2]!);
            if (parsedRed !== null && parsedGreen !== null && parsedBlue !== null) {
              red = parsedRed;
              green = parsedGreen;
              blue = parsedBlue;
            } else {
              return null;
            }
          } else {
            return null;
          }
        } else {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const context2d = canvas.getContext("2d");
          if (!context2d) return null;
          context2d.fillStyle = color;
          const normalized = String(context2d.fillStyle);
          const rgb2 = normalized.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
          if (rgb2) {
            red = parseInt(rgb2[1]!, 10);
            green = parseInt(rgb2[2]!, 10);
            blue = parseInt(rgb2[3]!, 10);
          } else if (normalized.startsWith("#") && normalized.length === 7) {
            red = parseInt(normalized.slice(1, 3), 16);
            green = parseInt(normalized.slice(3, 5), 16);
            blue = parseInt(normalized.slice(5, 7), 16);
          } else {
            return null;
          }
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

  function skipSvg(element: Element): boolean {
    return Boolean(element.closest("svg"));
  }

  addColor(getComputedStyle(document.documentElement).backgroundColor);
  if (document.body) {
    const bs = getComputedStyle(document.body);
    addColor(bs.backgroundColor);
    addColor(bs.color);
  }

  function addElementVisualColors(element: HTMLElement) {
    const computedStyle = getComputedStyle(element);
    addColor(computedStyle.backgroundColor);
    if (computedStyle.backgroundImage && computedStyle.backgroundImage !== "none") {
      addGradientColors(computedStyle.backgroundImage);
    }
    addColor(computedStyle.color);
    addColor(computedStyle.borderColor);
  }

  const buttonLikeSelector = [
    "button",
    '[role="button"]',
    'a[class*="btn"]',
    'a[class*="button"]',
    'input[type="button"]',
    'input[type="submit"]',
    'input[type="reset"]',
    '[aria-pressed="true"]',
    '[data-slot="button"]',
  ].join(", ");

  document.querySelectorAll<HTMLElement>(buttonLikeSelector).forEach((buttonLikeElement) => {
    if (skipSvg(buttonLikeElement)) return;
    addElementVisualColors(buttonLikeElement);
  });

  document.querySelectorAll<HTMLElement>("a[href]").forEach((linkElement) => {
    if (skipSvg(linkElement)) return;
    addColor(getComputedStyle(linkElement).color);
  });

  document.querySelectorAll<HTMLElement>("h1, h2, h3").forEach((headingElement) => {
    if (skipSvg(headingElement)) return;
    addColor(getComputedStyle(headingElement).color);
  });

  document
    .querySelectorAll<HTMLElement>('[class*="accent"], [class*="primary"], [class*="highlight"], [class*="brand"]')
    .forEach((highlightElement) => {
      if (skipSvg(highlightElement)) return;
      const style = getComputedStyle(highlightElement);
      addColor(style.color);
      addColor(style.backgroundColor);
      if (style.backgroundImage && style.backgroundImage !== "none") addGradientColors(style.backgroundImage);
    });

  const sortedColorEntries = [...colorCounts.entries()].sort((left, right) => right[1] - left[1]);
  const sortedHex = sortedColorEntries.map(([hex]) => hex);

  function isTooDarkOrTooLight(hexColor: string): boolean {
    const hexMatch = hexColor.match(/^#([0-9a-f]{6})$/i);
    if (!hexMatch) return false;
    const redValue = Number.parseInt(hexMatch[1]!.slice(0, 2), 16);
    const greenValue = Number.parseInt(hexMatch[1]!.slice(2, 4), 16);
    const blueValue = Number.parseInt(hexMatch[1]!.slice(4, 6), 16);
    const brightness = (redValue * 299 + greenValue * 587 + blueValue * 114) / 1000;
    return brightness < 48 || brightness > 222;
  }

  const primaryColor = sortedHex.find((hexValue) => !isTooDarkOrTooLight(hexValue)) ?? null;
  const minSecondaryColorCount = 3;
  const secondaryColor =
    sortedColorEntries.find(([hexValue, countValue]) => {
      if (hexValue === primaryColor) return false;
      if (countValue < minSecondaryColorCount) return false;
      return !isTooDarkOrTooLight(hexValue);
    })?.[0] ?? null;

  function resolveUrl(src: string): string {
    if (!src) return "";
    if (src.startsWith("http") || src.startsWith("//")) return src;
    return siteOrigin + (src.startsWith("/") ? src : "/" + src);
  }

  let logoUrl: string | null = null;

  function resolvedImgSrc(image: HTMLImageElement): string | null {
    const raw =
      image.currentSrc ||
      image.getAttribute("src") ||
      image.getAttribute("data-src") ||
      image.getAttribute("data-lazy-src") ||
      "";
    const trimmed = raw.trim();
    if (!trimmed) return null;
    return resolveUrl(trimmed);
  }

  function isSvgAssetUrl(url: string): boolean {
    const withoutQuery = url.split("?")[0]?.toLowerCase() ?? "";
    if (withoutQuery.endsWith(".svg")) return true;
    return url.trim().toLowerCase().startsWith("data:image/svg+xml");
  }

  function inFooterContext(image: HTMLImageElement): boolean {
    return Boolean(image.closest("footer, [role='contentinfo'], [class*='footer' i]"));
  }

  function inTopChromeContext(image: HTMLImageElement): boolean {
    return Boolean(
      image.closest(
        'header, nav, [role="banner"], [class*="header" i], [class*="navbar" i], [class*="nav-bar" i], [id*="header" i], [class*="masthead" i], [class*="topbar" i], [class*="top-bar" i], [class*="site-header" i], [class*="app-bar" i]',
      ),
    );
  }

  function hasLogoClassOrId(image: HTMLImageElement): boolean {
    const className = image.className?.toString() ?? "";
    const idValue = image.id ?? "";
    return /logo/i.test(className) || /logo/i.test(idValue);
  }

  function scoreLogoCandidate(image: HTMLImageElement, resolvedUrl: string): number {
    if (inFooterContext(image)) return -1000;
    let score = 0;
    if (isSvgAssetUrl(resolvedUrl)) score += 200;
    if (hasLogoClassOrId(image)) score += 120;
    if (inTopChromeContext(image)) score += 70;
    return score;
  }

  function collectLogoCandidateImages(): HTMLImageElement[] {
    const seen = new Set<HTMLImageElement>();
    const addUnique = (nodes: Iterable<HTMLImageElement>) => {
      for (const image of nodes) {
        if (image) seen.add(image);
      }
    };

    addUnique(
      document.querySelectorAll<HTMLImageElement>("img[class*='logo' i], img[id*='logo' i]"),
    );
    addUnique(
      document.querySelectorAll<HTMLImageElement>(
        'header img, nav img, [role="banner"] img, [class*="header" i] img, [class*="navbar" i] img, [class*="nav-bar" i] img, [id*="header" i] img, [class*="masthead" i] img, [class*="topbar" i] img, [class*="top-bar" i] img, [class*="site-header" i] img, [class*="app-bar" i] img',
      ),
    );

    const bodyRoot = document.body;
    if (bodyRoot) {
      let anchorIndex = 0;
      for (const anchorElement of bodyRoot.querySelectorAll<HTMLAnchorElement>("a[href]")) {
        if (anchorIndex++ >= 15) break;
        const nestedImg = anchorElement.querySelector<HTMLImageElement>("img");
        if (nestedImg) addUnique([nestedImg]);
      }
    }

    let mainAnchorIndex = 0;
    const mainRoot = document.querySelector("main");
    if (mainRoot) {
      for (const anchorElement of mainRoot.querySelectorAll<HTMLAnchorElement>("a[href]")) {
        if (mainAnchorIndex++ >= 6) break;
        const nestedImg = anchorElement.querySelector<HTMLImageElement>("img");
        if (nestedImg) addUnique([nestedImg]);
      }
    }

    return [...seen];
  }

  function isLikelyRootHomeLink(anchorElement: HTMLAnchorElement): boolean {
    const hrefAttr = anchorElement.getAttribute("href")?.trim() ?? "";
    if (hrefAttr === "/" || hrefAttr === "") return true;
    try {
      const resolved = new URL(hrefAttr, siteOrigin);
      const originUrl = new URL(siteOrigin);
      if (resolved.origin !== originUrl.origin) return false;
      const normalizedPath = resolved.pathname.replace(/\/+$/, "") || "/";
      return normalizedPath === "/" && resolved.search === "" && resolved.hash === "";
    } catch {
      return false;
    }
  }

  function topLevelSvgRootsUnderAnchor(anchorElement: HTMLAnchorElement): SVGSVGElement[] {
    const matches = anchorElement.querySelectorAll<SVGSVGElement>("svg");
    const roots: SVGSVGElement[] = [];
    for (const svgNode of matches) {
      const ancestorSvg = svgNode.parentElement?.closest("svg");
      if (ancestorSvg && anchorElement.contains(ancestorSvg)) {
        continue;
      }
      roots.push(svgNode);
    }
    return roots;
  }

  function measureSvgCloneSize(svgElement: SVGSVGElement): { width: number; height: number } {
    const holder = document.createElement("div");
    holder.setAttribute(
      "style",
      "position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;display:inline-block;line-height:0;",
    );
    const cloneForMeasure = svgElement.cloneNode(true) as SVGSVGElement;
    holder.appendChild(cloneForMeasure);
    document.body.appendChild(holder);
    let width = 0;
    let height = 0;
    try {
      const rect = cloneForMeasure.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    } catch {
      width = 0;
      height = 0;
    }
    if (width < 1 || height < 1) {
      try {
        const bbox = cloneForMeasure.getBBox();
        if (bbox.width > 0 && bbox.height > 0) {
          width = bbox.width;
          height = bbox.height;
        }
      } catch {
        width = 0;
        height = 0;
      }
    }
    if (width < 1 || height < 1) {
      const viewBox = cloneForMeasure.viewBox.baseVal;
      if (viewBox.width > 0 && viewBox.height > 0) {
        width = viewBox.width;
        height = viewBox.height;
      }
    }
    if (width < 1 || height < 1) {
      width = 24;
      height = 24;
    }
    document.body.removeChild(holder);
    return { width, height };
  }

  function combineSvgRootsToMarkup(svgRoots: SVGSVGElement[]): string {
    if (svgRoots.length === 0) return "";
    if (svgRoots.length === 1) {
      return new XMLSerializer().serializeToString(svgRoots[0]);
    }
    const xmlns = "http://www.w3.org/2000/svg";
    const gapBetween = 8;
    const padding = 8;
    const sizes = svgRoots.map((root) => measureSvgCloneSize(root));
    const maxRowHeight = Math.max(...sizes.map((size) => size.height), 1);
    const contentWidth =
      sizes.reduce((sum, size) => sum + size.width, 0) + gapBetween * (svgRoots.length - 1);
    const outerWidth = contentWidth + padding * 2;
    const outerHeight = maxRowHeight + padding * 2;

    const wrapper = document.createElementNS(xmlns, "svg");
    wrapper.setAttribute("viewBox", `0 0 ${outerWidth} ${outerHeight}`);
    wrapper.setAttribute("xmlns", xmlns);
    wrapper.setAttribute("preserveAspectRatio", "xMidYMid meet");

    let offsetX = padding;
    for (let index = 0; index < svgRoots.length; index++) {
      const root = svgRoots[index];
      const size = sizes[index];
      const offsetY = padding + (maxRowHeight - size.height) / 2;
      const group = document.createElementNS(xmlns, "g");
      group.setAttribute("transform", `translate(${offsetX}, ${offsetY})`);
      group.appendChild(root.cloneNode(true));
      wrapper.appendChild(group);
      offsetX += size.width + gapBetween;
    }
    return new XMLSerializer().serializeToString(wrapper);
  }

  function findInlineSvgDataUrlFromHeaderHomeLink(): string | null {
    const headerRoots = document.querySelectorAll(
      'header, [role="banner"], [class*="header" i], [class*="navbar" i], [class*="site-header" i], [class*="masthead" i], [id*="header" i]',
    );
    for (const root of headerRoots) {
      const anchors = root.querySelectorAll<HTMLAnchorElement>("a[href]");
      for (const anchorElement of anchors) {
        if (!isLikelyRootHomeLink(anchorElement)) continue;
        const svgRoots = topLevelSvgRootsUnderAnchor(anchorElement);
        if (svgRoots.length === 0) continue;
        const markup = combineSvgRootsToMarkup(svgRoots);
        if (!markup.trim()) continue;
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
      }
    }
    return null;
  }

  /** Inline SVG from `a[href="/"]` in header beats generic chrome images; below strong img+logo+SVG. */
  const scoreHeaderHomeInlineSvg = 280;

  let bestLogoScore = Number.NEGATIVE_INFINITY;
  let bestLogoResolved: string | null = null;
  for (const imageElement of collectLogoCandidateImages()) {
    const resolved = resolvedImgSrc(imageElement);
    if (!resolved) continue;
    const score = scoreLogoCandidate(imageElement, resolved);
    if (score < -500) continue;
    const beatsByScore = score > bestLogoScore;
    const tiePreferSvg =
      score === bestLogoScore &&
      bestLogoResolved !== null &&
      isSvgAssetUrl(resolved) &&
      !isSvgAssetUrl(bestLogoResolved);
    if (beatsByScore || tiePreferSvg) {
      bestLogoScore = score;
      bestLogoResolved = resolved;
    }
  }

  const headerHomeSvgDataUrl = findInlineSvgDataUrlFromHeaderHomeLink();
  if (headerHomeSvgDataUrl && scoreHeaderHomeInlineSvg > bestLogoScore) {
    bestLogoScore = scoreHeaderHomeInlineSvg;
    bestLogoResolved = headerHomeSvgDataUrl;
  }

  logoUrl = bestLogoResolved;

  let faviconUrl: string | null = null;
  const faviconSelectors = [
    'link[rel="icon"][type="image/svg+xml"]',
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
  ];
    for (const faviconSelector of faviconSelectors) {
      const linkElement = document.querySelector<HTMLLinkElement>(faviconSelector);
      if (linkElement?.href) {
        faviconUrl = linkElement.href;
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

  function primaryFontFamilyFor(element: Element): string | null {
    const stack = getComputedStyle(element).fontFamily
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
  for (const elementNode of nodes) {
    if (nodeCount++ >= maxNodes) break;
    const fam = primaryFontFamilyFor(elementNode);
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
}
