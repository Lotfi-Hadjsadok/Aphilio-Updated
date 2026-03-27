-- Drop old branding JSON blob column
ALTER TABLE "context" DROP COLUMN IF EXISTS "branding";

-- Drop old string typography column and recreate as JSONB
ALTER TABLE "context" DROP COLUMN IF EXISTS "typography";
ALTER TABLE "context" ADD COLUMN "typography" JSONB;

-- Add AI-derived personality column
ALTER TABLE "context" ADD COLUMN IF NOT EXISTS "personality" JSONB;

-- Add AI-derived marketing angles column
ALTER TABLE "context" ADD COLUMN IF NOT EXISTS "marketingAngles" JSONB;
