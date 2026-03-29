-- AlterTable
ALTER TABLE "user" ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "onboardingDraftUrl" TEXT;
