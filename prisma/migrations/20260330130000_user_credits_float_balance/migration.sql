-- AlterTable: change aphilio_credits_balance from INTEGER to DOUBLE PRECISION
-- to support fractional credit costs (e.g. 1.5 for premium image generation).
ALTER TABLE "user" ALTER COLUMN "aphilio_credits_balance" TYPE DOUBLE PRECISION;
