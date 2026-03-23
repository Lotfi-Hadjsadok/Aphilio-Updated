---
description: Context scraping server actions — Playwright, Cheerio, Turndown, Prisma
alwaysApply: false
---

# `app/actions/scrape.ts`

Server actions that scrape a URL into structured markdown, branding metadata, and Prisma rows (`scrapedContext`, `subContext`, `contextDocument`).

## Exports

| Export | Role |
|--------|------|
| `scrapeWebsite` | Form action (`useActionState`): validates session, dedupes by user + normalized host + path, runs `buildScrapedContent`, persists. |
| `loadContextFromLibrary` | Form action (`useActionState`): reads `contextId` from `FormData`, calls `loadSavedContext`. |
| `listSavedContexts` | Returns the current user’s saved sites for the library UI (latest **100** by `updatedAt` desc). |
| `loadSavedContext` | Loads one context by id; `{ ok, result }` or `{ ok: false, error }` (unauthorized / not found). |
| `getScrapedContexts` | Lists contexts as `ScrapeResult[]` (latest **50** by `createdAt` desc), rebuilt from stored documents. |

**Types:** `ScrapeResult`, `ScrapeState`, `LibraryLoadState`, `SavedContextSummary`, `SubpageSnapshot`, `ScrapedSection`, `BrandingDNA`, `BrandingPersonality`.

- **`ScrapeResult`:** When a site has more than one scraped path, `subpages` lists every path (`SubpageSnapshot[]`); the top-level `markdown` / `sections` / `scrapedUrl` reflect the **first** subcontext (ordered by path).

## Pipeline (`buildScrapedContent`)

1. **Playwright** — Chromium, desktop `userAgent`, `page.goto(..., waitUntil: `"load"`, timeout **600s**). If HTTP status **≥ 400**, returns a user-facing error with that status.
2. **`waitForPageReady`** — `networkidle` (12s timeout, errors ignored) + short post-load settle (**600ms**).
3. **Title + HTML** — `page.title()`, `page.content()`, then **`extractBranding`** (still in browser), then **page is closed**.
4. **`extractBranding`** — `page.evaluate`: `document.fonts.ready`, color sampling (computed styles, CSS vars on `:root`, buttons/links/headings, brand-ish classes), including gradient stop colors from `background-image`, logo/favicon/OG image, font frequency (capped node walk), typography summary. Returns visual data only (`BrandingExtracted`); **no** `personality` yet.
5. **Cheerio** — `loadCleanContentRoot`: strip `script`, `style`, `noscript`, `svg`, `iframe`, `template`, `link[rel=preload]`; prefer `<main>` → `<article>` → `body`; dedupe `<img>` by resolved URL (`src` / lazy attrs / first `srcset` entry).
6. **Sections** — `splitIntoSectionHtmls`: prefer multiple **top-level** `<section>` blocks (nested sections recurse up to depth **10**); else split at the **smallest present heading level** (`h1`…`h6`). Turndown each chunk; **`stripLeadingAtxHeadingIfMatches`** removes duplicate ATX headings vs stored `heading`; **`cleanExtractedMarkdown`** normalizes whitespace.
7. **Combine** — `combineSectionsToMarkdown` joins sections with `---` and optional `##` headings.
8. **Images in markdown** — **`dedupeMarkdownImageReferences`** drops repeated `![alt](url)` lines by normalized URL across sections (shared `Set`).
9. **Personality** — If branding extraction succeeded: read `og:description` / `meta name=description`, then **`analyzePersonality(markdown, ogDescription)`** fills `BrandingDNA.personality` (keyword heuristics for tone, energy, audience).

**Turndown:** Custom rule strips `<svg>` nodes.

## Dedupe rules (`scrapeWebsite`)

- **Host:** `normalizeHostname` (lowercase, strip `www.`).
- **Path:** `normalizePath` (leading `/`, no trailing slash except root).
- Skip if a `subContext` already exists for that `contextId` + `path`.

## Persistence (transaction)

- **`scrapedContext`:** Created on first path for that `baseUrl`; denormalized `logo`, `primaryColor`, `secondaryColor`, `typography`, plus JSON **`branding`** when present.
- **`subContext`:** One row per scraped path.
- **`contextDocument`:** One row per section; `section` is the heading or `"Content"`; **`images`** / **`videos`** derived from markdown via `extractImageUrlsFromMarkdown` and `extractVideoUrlsFromMarkdown` (video URLs matched by extension in link/image patterns).

## Errors (user-facing strings)

Constants: unauthorized, invalid URL, empty content, already scraped path. **`buildScrapedContent`** may also return *The page returned status {n}.* or empty-content errors.

## Dependencies

- `playwright` — headless fetch and in-page branding script.
- `cheerio` — DOM cleanup and section splitting.
- `turndown` — HTML → Markdown (custom rule strips `<svg>`).
- `auth` + `prisma` — session and persistence.

When changing persistence, keep **`mergeBrandingFromRecord`** in sync with nullable columns vs JSON `branding` on `scrapedContext` (it merges column overrides with stored JSON, including default `personality` when missing).
