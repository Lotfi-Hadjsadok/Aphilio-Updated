CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "context_document" ADD COLUMN IF NOT EXISTS "embedding_vector" vector(1536);

UPDATE "context_document"
SET "embedding_vector" = (embedding::text)::vector
WHERE
  embedding IS NOT NULL
  AND jsonb_typeof(embedding) = 'array'
  AND jsonb_array_length(embedding) = 1536;

-- Optional: add `USING hnsw ("embedding_vector" vector_cosine_ops)` when the table is large.
