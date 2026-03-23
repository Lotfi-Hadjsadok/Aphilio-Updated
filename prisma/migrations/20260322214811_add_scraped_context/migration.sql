-- CreateTable
CREATE TABLE "scraped_context" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "pages" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "scraped_context_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "scraped_context" ADD CONSTRAINT "scraped_context_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
