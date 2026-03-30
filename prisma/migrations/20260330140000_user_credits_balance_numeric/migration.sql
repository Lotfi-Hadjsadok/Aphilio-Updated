-- Exact fractional credits (e.g. 75.50). INTEGER truncated decimals; DOUBLE PRECISION can drift.
ALTER TABLE "user"
  ALTER COLUMN "aphilio_credits_balance"
  TYPE NUMERIC(10, 2)
  USING (ROUND(COALESCE("aphilio_credits_balance", 0)::numeric, 2));

ALTER TABLE "user"
  ALTER COLUMN "aphilio_credits_balance"
  SET DEFAULT 0;
