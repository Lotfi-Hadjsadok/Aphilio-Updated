-- CreateTable
CREATE TABLE "sub_context" (
    "id" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "sub_context_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "context_document" (
    "id" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "subcontextId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videos" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "context_document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sub_context_contextId_path_key" ON "sub_context"("contextId", "path");

-- AddForeignKey
ALTER TABLE "sub_context" ADD CONSTRAINT "sub_context_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "scraped_context"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "context_document" ADD CONSTRAINT "context_document_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "scraped_context"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "context_document" ADD CONSTRAINT "context_document_subcontextId_fkey" FOREIGN KEY ("subcontextId") REFERENCES "sub_context"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: add new columns (nullable for backfill)
ALTER TABLE "scraped_context" ADD COLUMN "baseUrl" TEXT;
ALTER TABLE "scraped_context" ADD COLUMN "name" TEXT;
ALTER TABLE "scraped_context" ADD COLUMN "updatedAt" TIMESTAMP(3);
ALTER TABLE "scraped_context" ADD COLUMN "logo" TEXT;
ALTER TABLE "scraped_context" ADD COLUMN "primaryColor" TEXT;
ALTER TABLE "scraped_context" ADD COLUMN "secondaryColor" TEXT;
ALTER TABLE "scraped_context" ADD COLUMN "typography" TEXT;

-- Backfill baseUrl, name, updatedAt from legacy columns
UPDATE "scraped_context"
SET
  "baseUrl" = LOWER(REGEXP_REPLACE("url", '^https?://([^/]+).*$', '\1')),
  "name" = COALESCE("title", LOWER(REGEXP_REPLACE("url", '^https?://([^/]+).*$', '\1'))),
  "updatedAt" = "createdAt"
WHERE "baseUrl" IS NULL;

-- Flatten branding JSON into columns where present
UPDATE "scraped_context"
SET
  "logo" = NULLIF(TRIM(both '"' FROM (branding->>'logo')), ''),
  "primaryColor" = NULLIF(branding->'colors'->>'primary', ''),
  "secondaryColor" = NULLIF(branding->'colors'->>'secondary', ''),
  "typography" = NULLIF(branding->>'typography', '')
WHERE "branding" IS NOT NULL;

-- Migrate legacy `pages` JSON into sub_context + context_document
DO $$
DECLARE
  r RECORD;
  page jsonb;
  sec jsonb;
  sub_id TEXT;
  path_text TEXT;
  page_title TEXT;
  page_url TEXT;
  raw_path TEXT;
BEGIN
  FOR r IN SELECT id, "pages"::jsonb AS p FROM "scraped_context" WHERE "pages" IS NOT NULL AND jsonb_typeof("pages"::jsonb) = 'array'
  LOOP
    FOR page IN SELECT value FROM jsonb_array_elements(r.p)
    LOOP
      page_url := page->>'url';
      page_title := COALESCE(NULLIF(page->>'title', ''), 'Untitled');

      IF page_url IS NULL OR page_url = '' THEN
        path_text := '/';
      ELSE
        raw_path := regexp_replace(page_url, '^https?://[^/]+', '');
        IF raw_path IS NULL OR raw_path = '' THEN
          path_text := '/';
        ELSE
          path_text := raw_path;
        END IF;
      END IF;

      sub_id := gen_random_uuid()::text;

      INSERT INTO "sub_context" ("id", "contextId", "path", "title")
      VALUES (sub_id, r.id, path_text, page_title);

      FOR sec IN SELECT value FROM jsonb_array_elements(COALESCE(page->'sections', '[]'::jsonb))
      LOOP
        INSERT INTO "context_document" ("id", "contextId", "subcontextId", "section", "content", "images", "videos")
        VALUES (
          gen_random_uuid()::text,
          r.id,
          sub_id,
          COALESCE(NULLIF(sec->>'heading', ''), 'Content'),
          COALESCE(sec->>'content', ''),
          ARRAY[]::TEXT[],
          ARRAY[]::TEXT[]
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Drop legacy columns
ALTER TABLE "scraped_context" DROP COLUMN "url";
ALTER TABLE "scraped_context" DROP COLUMN "title";
ALTER TABLE "scraped_context" DROP COLUMN "pages";

-- Enforce NOT NULL on new required fields
ALTER TABLE "scraped_context" ALTER COLUMN "baseUrl" SET NOT NULL;
ALTER TABLE "scraped_context" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "scraped_context" ALTER COLUMN "updatedAt" SET NOT NULL;
