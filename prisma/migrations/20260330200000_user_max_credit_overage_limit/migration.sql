-- Max debt in stored units (same scale as aphilio_credits_balance) when allow_credit_overage is true; NULL = no local cap.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "max_credit_overage_stored_units" INTEGER;
