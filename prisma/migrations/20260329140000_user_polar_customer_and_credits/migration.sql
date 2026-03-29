-- AlterTable
ALTER TABLE "user" ADD COLUMN     "polar_customer_id" TEXT,
ADD COLUMN     "aphilio_credits_balance" INTEGER NOT NULL DEFAULT 0;
