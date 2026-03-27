-- CreateTable
CREATE TABLE "generated_creative" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contextId" TEXT NOT NULL,
    "r2Key" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "templateLabel" TEXT NOT NULL,
    "aspectRatio" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "subheadline" TEXT,
    "prompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_creative_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "generated_creative" ADD CONSTRAINT "generated_creative_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
