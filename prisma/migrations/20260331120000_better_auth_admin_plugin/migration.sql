-- Better Auth admin plugin: roles, ban fields, impersonation marker on session.

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ban_reason" TEXT;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "ban_expires" TIMESTAMP(3);

UPDATE "user" SET "role" = 'subscriber' WHERE "role" IS NULL;

ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "impersonated_by" TEXT;
