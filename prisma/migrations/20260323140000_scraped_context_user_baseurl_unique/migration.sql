-- Deduplicate: keep oldest row per (userId, baseUrl); children cascade-delete with duplicate parents
DELETE FROM "scraped_context" AS sc
WHERE sc.id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY "userId", "baseUrl" ORDER BY "createdAt" ASC, id ASC) AS rn
    FROM "scraped_context"
  ) t
  WHERE rn > 1
);

-- CreateIndex
CREATE UNIQUE INDEX "scraped_context_userId_baseUrl_key" ON "scraped_context"("userId", "baseUrl");
