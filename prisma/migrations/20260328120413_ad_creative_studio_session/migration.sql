-- AlterTable
ALTER TABLE "generated_creative" ADD COLUMN     "slotIndex" INTEGER,
ADD COLUMN     "studioSessionId" TEXT;

-- CreateTable
CREATE TABLE "ad_creative_studio_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Ad studio session',
    "contextNameCache" TEXT NOT NULL DEFAULT '',
    "activeStep" INTEGER NOT NULL DEFAULT 2,
    "furthestStep" INTEGER NOT NULL DEFAULT 2,
    "selectedAngles" JSONB,
    "angleStepData" JSONB,
    "sectionIds" JSONB,
    "selectedTemplates" JSONB,
    "prompts" JSONB,
    "slotOutcomes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_creative_studio_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ad_creative_studio_session_userId_updatedAt_idx" ON "ad_creative_studio_session"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "ad_creative_studio_session_userId_contextId_idx" ON "ad_creative_studio_session"("userId", "contextId");

-- CreateIndex
CREATE INDEX "generated_creative_studioSessionId_idx" ON "generated_creative"("studioSessionId");

-- AddForeignKey
ALTER TABLE "ad_creative_studio_session" ADD CONSTRAINT "ad_creative_studio_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_creative" ADD CONSTRAINT "generated_creative_studioSessionId_fkey" FOREIGN KEY ("studioSessionId") REFERENCES "ad_creative_studio_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
