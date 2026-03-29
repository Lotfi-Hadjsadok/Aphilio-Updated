-- AlterTable
ALTER TABLE "user" ADD COLUMN "polar_subscription_status" TEXT,
ADD COLUMN "polar_subscription_current_period_end" TIMESTAMP(3),
ADD COLUMN "polar_subscription_ends_at" TIMESTAMP(3);
