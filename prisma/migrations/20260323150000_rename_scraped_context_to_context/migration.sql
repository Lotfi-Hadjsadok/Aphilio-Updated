-- Rename table scraped_context -> context
ALTER TABLE "scraped_context" RENAME TO "context";

-- Align constraint and index names with the new table name
ALTER TABLE "context" RENAME CONSTRAINT "scraped_context_pkey" TO "context_pkey";
ALTER TABLE "context" RENAME CONSTRAINT "scraped_context_userId_fkey" TO "context_userId_fkey";
ALTER INDEX "scraped_context_userId_baseUrl_key" RENAME TO "context_userId_baseUrl_key";
