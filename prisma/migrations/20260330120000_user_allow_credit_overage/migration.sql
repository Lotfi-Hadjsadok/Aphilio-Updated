-- Allow users to opt in to spending beyond cached credit balance (Polar meter may still enforce limits).
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "allow_credit_overage" BOOLEAN NOT NULL DEFAULT false;
