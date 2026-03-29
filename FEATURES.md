# Aphilio — product features and capabilities

Aphilio is a **brand intelligence and creative workspace**: it captures structured context from real sites (often called “brand DNA”), lets you **explore and reuse** that context, and powers **AI chat** and **ad creative generation** on top of it. DNA is the foundation, not the whole product.

This document reflects what is **implemented in this repository** (routes, server actions, data models, and integrations).

---

## 1. Authentication and billing

- **Sign-in** via [Better Auth](https://www.better-auth.com/) with **Google OAuth** (`lib/auth.ts`).
- **Polar** integration for subscriptions: checkout (monthly/yearly product slugs), customer portal, and webhooks (`@polar-sh/better-auth`). Customers are created on sign-up.
- **Subscription gating**: Chat and Ad Creatives entry points on the dashboard require an active Polar subscription (`lib/polar-subscription.ts`, `app/dashboard/page.tsx`). DNA capture and the creative library remain accessible per current logic.
- Auth API is mounted at `app/api/auth/[...all]/route.ts` (Better Auth catch-all).

---

## 2. Internationalization (i18n)

- **next-intl** for server and client translations; message catalogs under `messages/` (e.g. English plus Arabic, German, Spanish, French, Hindi, Italian, Japanese, Korean, Dutch, Polish, Portuguese, Russian, Swedish, Turkish, Chinese).
- **Language switcher** in the dashboard header; **locale sync** from the user’s saved `preferredLanguage` (`components/locale-sync.tsx`, `app/actions/locale.ts`).
- Onboarding includes an explicit **language preference** step persisted on the user record (`User.preferredLanguage`, cookie `NEXT_LOCALE`).

---

## 3. Onboarding

- Multi-step flow: welcome → URL → language → scrape-related completion (`app/dashboard/onboarding/`, `app/actions/onboarding.ts`).
- Progress is **persisted** on the user: `onboardingStep`, `onboardingDraftUrl`, and `onboardingCompleted` (`prisma/schema.prisma`).
- Can **resume** after refresh using the draft URL and step.
- **Duplicate URL handling**: can detect an existing scraped context for the same hostname to avoid redundant work (`findExistingContextByUrl`).

---

## 4. Brand capture (“DNA” / context retriever)

Canonical UI lives under **`/dashboard/dna`**. **`/dashboard/context-retriever`** redirects to `/dashboard/dna` for backward-compatible URLs.

### 4.1 Scraping and structuring

- **Playwright (Chromium)** loads pages in a real browser; **Cheerio** and **Turndown** help parse and normalize HTML into markdown-style sections.
- **Subpages**: multiple paths per hostname are stored as `SubContext` rows linked to one `ScrapedContext`.
- **Per-section documents** (`ContextDocument`): section title + long text content, with optional **embeddings** for semantic search.
- **Media**: images and video URLs are extracted and stored per document (`ContextDocumentImage`, `ContextDocumentVideo`), including common embed hosts (YouTube, Vimeo, Loom, etc.) and direct video files.
- **Branding signals** on the context: logo, favicon, primary/secondary colors, OG image, typography JSON (`ScrapedContext`).
- **In-browser branding evaluation** supplements extraction (`app/actions/scrape-branding-page-evaluate.ts`).

### 4.2 AI-enriched profile

- After scrape, the pipeline runs **personality and marketing-angle analysis** (via `lib/langchain.ts` and `app/actions/scrape.ts`), persisting `personality` and `marketingAngles` JSON on the context.

### 4.3 Vector search (RAG foundation)

- Embeddings use **OpenAI `text-embedding-3-small`** (1536 dimensions), stored both as JSON and in **PostgreSQL pgvector** (`embedding_vector`) for cosine similarity.
- Used downstream for **ad angles**, **prompt-aligned reference images**, and **chat** snippets (see §6–§8).

### 4.4 Library of brands

- Users maintain a **list of saved contexts** (brands) from the DNA hub; individual brand detail is **`/dashboard/dna/[contextId]`** (rich “result” UI in `app/dashboard/context-retriever/context-result-view.tsx` and related tiles: colors, typography, voice, tools, marketing angles, hero, bento layout, delete flow, etc.).
- Server actions in `app/actions/scrape.ts` cover listing, loading, deleting DNA, and the full scrape pipeline.

---

## 5. Ad Creative Studio

- **Route**: `/dashboard/ad-creatives`.
- **Workflow** (high level): pick a brand → choose **marketing angles** (with **similar-document and reference-image preview** via embedding search) → configure **templates**, headlines, and **aspect ratios** → generate **multiple layout slots** with tracked per-slot outcomes.
- **Persisted sessions** (`AdCreativeStudioSession`): title, step position, selected angles, templates, prompts, slot outcomes, etc., so users can **resume** and browse **history** (`app/actions/ad-creative-studio-sessions.ts`, `lib/ad-creative-studio-persist.ts`).
- **Templates** are grouped (e.g. Pain & Emotion, Product & Feature, Social Proof, Offer & CTA, Seasonal, B2B) with **default aspect ratios** (`lib/ad-creatives-templates.ts` — 1:1, 4:5, 9:16, 16:9 aligned to common ad placements).
- **Quality modes**: “fast” vs “premium” image models (`IMAGE_MODEL_FAST` / `IMAGE_MODEL_PREMIUM` in `lib/langchain.ts` — Gemini image preview variants).
- **Reference images**: pulled from site scrape and ranked by **semantic similarity** to angles or prompts; logo fidelity and reference-image rules are injected into image system prompts (`lib/ad-creatives-prompts.ts`).
- **Outputs** are saved as `GeneratedCreative` rows and **uploaded to Cloudflare R2** as optimized WebP (`lib/r2.ts`, `app/actions/ad-creatives.ts`).

---

## 6. Creative library

- **Route**: `/dashboard/library`.
- Paginated grid of **user-generated creatives** (server action `fetchLibraryAction` in `app/actions/library.ts`).
- **Delete** removes the DB row and the **R2 object** (`deleteCreativeAction`).

---

## 7. Brand-aware chat

- **Route**: `/dashboard/chat` (subscription-gated from the hub).
- **Conversations** and **messages** are persisted (`ChatConversation`, `ChatPersistedMessage`) via `app/actions/chat.ts`.
- Users can attach **brand context** to a thread; messages can store **generated images**, aspect ratio, and **reference image URLs** used for generation.
- For text, the user message is embedded and **similar chunks** are retrieved from `context_document` via pgvector to **enrich prompts** (`findSimilarTextForQuery` pattern in `app/actions/chat.ts`).
- Image generation in chat reuses **langchain** helpers and **R2** upload, with brand personality and colors folded into the brief.

---

## 8. AI and models (as coded)

| Area | Implementation notes |
|------|----------------------|
| Chat / structured JSON / analysis | **LangChain** with **Google Gemini** (`ChatGoogle`, e.g. `gemini-2.5-flash` in `lib/langchain.ts`) |
| Embeddings | **OpenAI** `text-embedding-3-small` via `@langchain/openai` |
| Ad + chat image generation | Gemini **image** models (`gemini-3.1-flash-image-preview`, `gemini-3-pro-image-preview`) |
| Prompting | Centralized ad/creative prompt strings in `lib/ad-creatives-prompts.ts` |

---

## 9. Dashboard hub and marketing surface

- **`/dashboard`**: welcome copy, tool cards for **DNA**, **Chat**, and **Ad Creatives**, library link, language switcher, logout, and a **three-step workflow** hint (capture → create → collect).
- **`/` (landing)**: marketing layout with feature blocks, trust items, steps, and sign-in/dashboard entry (`app/page.tsx`).

---

## 10. Data model (feature mapping)

| Model | Role |
|-------|------|
| `User` | Profile, onboarding flags, preferred language |
| `ScrapedContext` | One brand/site profile per user + hostname |
| `SubContext` | Paths/pages under that brand |
| `ContextDocument` | Section text + embeddings + link to images/videos |
| `ChatConversation` / `ChatPersistedMessage` | Chat threads and content |
| `AdCreativeStudioSession` | Saved ad-studio runs |
| `GeneratedCreative` | Final ad images (R2 key + public URL + metadata) |

---

## 11. Stack summary

- **Framework**: Next.js (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui-style components.
- **Database**: PostgreSQL + Prisma; pgvector for embeddings.
- **Auth / payments**: Better Auth + Polar.
- **Storage**: Cloudflare R2 (S3-compatible) for generated images.
- **Scraping**: Playwright, Cheerio, html-to-text / turndown as needed.

---

## 12. Redirects and aliases

- `/dashboard/context-retriever` → `/dashboard/dna`
- `/dashboard/context-retriever/[contextId]` → `/dashboard/dna/[contextId]`

---

*Last updated from codebase review (March 2026). For environment variables and local setup, see `.env.example`.*
