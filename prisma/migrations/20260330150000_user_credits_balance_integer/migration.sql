-- Store credits as integer units (balance × 100).
-- 78.5 credits → 7850, 1 credit → 100, 1.5 credits → 150.
-- Existing NUMERIC values are multiplied by 100 and rounded to the nearest integer.
ALTER TABLE "user"
  ALTER COLUMN "aphilio_credits_balance"
  TYPE INTEGER
  USING (ROUND("aphilio_credits_balance" * 100)::integer);

ALTER TABLE "user"
  ALTER COLUMN "aphilio_credits_balance"
  SET DEFAULT 0;
