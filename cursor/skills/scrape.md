---
description: Context scraping server actions — Playwright, Cheerio, Turndown, Prisma
alwaysApply: false
---

# Context scraping (`app/actions/scrape.ts`)

Server actions that scrape a URL into structured markdown, branding metadata, and Prisma rows (`scrapedContext`, `subContext`, `contextDocument`, `contextDocumentImage`, `contextDocumentVideo`).

## Related module

| File | Role |
|------|------|
| `app/actions/scrape-branding-page-evaluate.ts` | **Playwright `page.evaluate` only** — `extractBrandingInBrowserContext(siteOrigin)`. Serialized into Chromium; no imports and no closure over server code. Returns `BrandingPageEvaluatePayload` (colors, logo, favicon, OG image, fonts, typography). |

`app/actions/scrape.ts` wires Playwright: `extractBranding` calls `page.evaluate(extractBrandingInBrowserContext, origin)` and maps the payload into `BrandingExtracted` (`BrandingDNA` without `personality`).

## Exports (`scrape.ts`)

| Export | Role |
|--------|------|
| `scrapeWebsite` | Form action (`useActionState`): validates session, dedupes by user + normalized host + path, runs `buildScrapedContent`, persists. |
| `loadContextFromLibrary` | Form action (`useActionState`): reads `contextId` from `FormData`, calls `loadSavedContext`. |
| `listSavedContexts` | Returns the current user’s saved sites for the library UI (latest **100** by `updatedAt` desc). |
| `loadSavedContext` | Loads one context by id; `{ ok, result }` or `{ ok: false, error }` (unauthorized / not found). |
| `getScrapedContexts` | Lists contexts as `ScrapeResult[]` (latest **50** by `createdAt` desc), rebuilt from stored documents. |
| `deleteSavedContext` | Form action (`useActionState`): deletes a context by `contextId` for the current user; returns `DeleteDNAState`. |

**Types:** `ScrapeResult`, `ScrapeState`, `LibraryLoadState`, `DeleteDNAState`, `SavedContextSummary`, `SubpageSnapshot`, `ScrapedSection`, `BrandingDNA`, `BrandingPersonality`.

- **`ScrapeResult`:** When a site has more than one scraped path, `subpages` lists every path (`SubpageSnapshot[]`); the top-level `markdown` / `sections` / `scrapedUrl` reflect the **first** subcontext (ordered by path).

## Pipeline (`buildScrapedContent`)

1. **Playwright** — Chromium, desktop `userAgent`, `page.goto(..., waitUntil: `"load"`, timeout **600s**). If HTTP status **≥ 400**, returns a user-facing error with that status.
2. **`waitForPageReady`** — `networkidle` (12s timeout, errors ignored) + short post-load settle (**600ms**).
3. **Title + HTML** — `page.title()`, `page.content()`, then **`extractBranding`** (in-page script in `scrape-branding-page-evaluate.ts`), then **page is closed**.
4. **In-browser branding** — `document.fonts.ready`, color sampling (computed styles, CSS vars on `:root`, buttons/links/headings, brand-ish classes), including gradient stop colors from `background-image`, logo/favicon/OG image, font frequency (capped node walk), typography summary. Returns visual data only; **no** `personality` until markdown exists.
5. **Cheerio** — `loadCleanContentRoot(fullHtml, pageBaseUrl)`:
   - Removes `script`, `style`, `noscript`, `svg`, `template`, `link[rel=preload]` (not all iframes).
   - **`pruneNonVideoIframes`**: removes `<iframe>` whose resolved `src` is **not** a trackable video URL (`isTrackableVideoUrl`). Keeps YouTube, Vimeo, Loom, Wistia, Streamable, Dailymotion, etc., and drops maps/widgets/ads iframes.
   - Prefers `<main>` → `<article>` → `body`; dedupe `<img>` by resolved URL (`src` / lazy attrs / first `srcset` entry).
6. **Sections** — `splitIntoSectionHtmls`:
   - Prefer multiple **top-level** `<section>` blocks (nested sections recurse up to depth **10**); heading text from first semantic heading inside the block, or `aria-label` / `title`.
   - Otherwise split at the **minimum** present outline level among `h1`–`h6` and `[role="heading"]` (with `aria-level` or default **2** for role-only headings).
   - Slicing uses **document order** on a cloned subtree (not string-splitting on tags), so layout siblings (e.g. grid columns) stay with the correct heading block.
7. **Per section** — `absolutizeImgAndMediaInHtml`: absolute URLs for `img`, `video` / `source`, `iframe`, and `a[href]` when the link is a trackable video URL.
8. **Turndown** — HTML → Markdown:
   - Strips `<svg>`.
   - **`<video>`** → one or more `[label](url)` lines (`<video src>` + each `<source src>`, deduped).
   - **`<iframe>`** with trackable `src` → `[label](url)` (embeds preserved because step 5 no longer deletes all iframes).
9. **`stripLeadingAtxHeadingIfMatches`** — removes duplicate ATX headings vs stored `heading`; **`cleanExtractedMarkdown`** normalizes whitespace.
10. **Post-process** — **`dedupeMarkdownImageReferences`** dedupes `![alt](url)` by normalized URL (shared `Set` across sections); **`absolutizeMarkdownVideoLinks`** absolutizes `[label](url)` when the destination is trackable video.
11. **Combine** — `combineSectionsToMarkdown` joins sections with `---` and optional `##` headings.
12. **Personality** — If branding extraction succeeded: read `og:description` / `meta name=description`, then **`analyzePersonality(markdown, ogDescription)`** fills `BrandingDNA.personality` (keyword heuristics for tone, energy, audience).

## Video tracking

- **`isTrackableVideoUrl`**: file extensions (e.g. `mp4`, `webm`, `m3u8`, …) **or** known embed hosts after resolving the URL.
- **`extractVideoUrlsFromMarkdown`**: collects URLs from both `![...](...)` and `[...](...)` patterns when the destination is trackable (so poster/thumbnail image syntax pointing at a video file is still stored).

## Session helper

`readSession()` centralizes `auth.api.getSession({ headers: await headers() })` for all actions in `scrape.ts`.

## Dedupe rules (`scrapeWebsite`)

- **Host:** `normalizeHostname` (lowercase, strip `www.`).
- **Path:** `normalizePath` (leading `/`, no trailing slash except root).
- Skip if a `subContext` already exists for that `contextId` + `path`.

## Persistence (transaction)

- **`scrapedContext`:** Created on first path for that `baseUrl`; denormalized `logo`, `primaryColor`, `secondaryColor`, `typography`, plus JSON **`branding`** when present.
- **`subContext`:** One row per scraped path.
- **`contextDocument`:** One row per section; `section` is the heading or `"Content"`.
- **`contextDocumentImage`:** URLs from `extractImageUrlsFromMarkdown` per section.
- **`contextDocumentVideo`:** URLs from `extractVideoUrlsFromMarkdown` per section (file URLs + embeds per `isTrackableVideoUrl`).

## Errors (user-facing strings)

Constants: unauthorized, invalid URL, empty content, already scraped path. **`buildScrapedContent`** may also return *The page returned status {n}.* or empty-content errors.

## Dependencies

- `playwright` — headless fetch and in-page branding script.
- `cheerio` — DOM cleanup, iframe pruning, section splitting.
- `turndown` — HTML → Markdown (custom rules for `svg`, `video`, video `iframe`).
- `auth` + `prisma` — session and persistence.

When changing persistence, keep **`mergeBrandingFromRecord`** in sync with nullable columns vs JSON `branding` on `scrapedContext` (it merges column overrides with stored JSON, including default `personality` when missing).

When changing in-browser branding behavior, edit **`scrape-branding-page-evaluate.ts`** only — keep that file free of server imports so Playwright serialization stays valid.
