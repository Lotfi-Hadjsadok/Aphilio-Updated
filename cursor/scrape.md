---
description: Context scraping server actions — Playwright, Cheerio, Turndown, Prisma
alwaysApply: false
---

# `app/actions/scrape.ts`

Server actions that scrape a URL into structured markdown, branding metadata, and Prisma rows (`scrapedContext`, `subContext`, `contextDocument`).

## Exports

| Export | Role |
|--------|------|
| `scrapeWebsite` | Form action: validates session, dedupes by user + normalized host + path, runs pipeline, persists. |
| `getScrapedContexts` | Lists the current user’s contexts (latest 50), rebuilds markdown from stored documents. |
| Types: `ScrapeResult`, `ScrapeState`, `ScrapedSection`, `BrandingDNA`, `BrandingPersonality` | Public shapes for UI and `useActionState`. |

## Pipeline (`buildScrapedContent`)

1. **Playwright** — Chromium, `page.goto` with long timeout, `networkidle` + short settle.
2. **`extractBranding`** — `page.evaluate` in the browser: colors (computed styles, CSS vars), logo/favicon/OG image, font frequency, typography summary. Returns `BrandingExtracted` (no `personality` yet).
3. **Cheerio** — Prefer `<main>` / `<article>` / `body`, strip scripts/styles/svg, dedupe `<img>` by resolved URL.
4. **Sections** — Split by top-level `<section>` or smallest heading level present; Turndown each chunk; dedupe markdown image refs across sections.
5. **Personality** — `analyzePersonality(markdown, og:description)` fills `BrandingDNA.personality` after markdown exists.

## Dedupe rules (`scrapeWebsite`)

- **Host:** `normalizeHostname` (lowercase, strip `www.`).
- **Path:** `normalizePath` (leading `/`, no trailing slash except root).
- Skip if a `subContext` already exists for that `contextId` + `path`.

## Errors (user-facing strings)

Constants at top of file: unauthorized, invalid URL, empty content, already scraped path.

## Dependencies

- `playwright` — headless fetch and in-page branding script.
- `cheerio` — DOM cleanup and section splitting.
- `turndown` — HTML → Markdown (custom rule strips `<svg>`).
- `auth` + `prisma` — session and persistence.

When changing persistence, keep `mergeBrandingFromRecord` in sync with nullable columns vs JSON `branding` on `scrapedContext`.
