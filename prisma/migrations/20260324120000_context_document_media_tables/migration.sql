-- Create normalized media tables
CREATE TABLE "context_document_image" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "context_document_image_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "context_document_video" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "context_document_video_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "context_document_image_documentId_idx" ON "context_document_image"("documentId");
CREATE INDEX "context_document_video_documentId_idx" ON "context_document_video"("documentId");

ALTER TABLE "context_document_image" ADD CONSTRAINT "context_document_image_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "context_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "context_document_video" ADD CONSTRAINT "context_document_video_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "context_document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing array columns into rows (preserve order)
INSERT INTO "context_document_image" ("id", "documentId", "url", "sortOrder")
SELECT
    'img_' || replace(gen_random_uuid()::text, '-', ''),
    cd."id",
    image_row.image_url,
    (image_row.ord - 1)::integer
FROM "context_document" cd
CROSS JOIN LATERAL unnest(cd."images") WITH ORDINALITY AS image_row(image_url, ord);

INSERT INTO "context_document_video" ("id", "documentId", "url", "sortOrder")
SELECT
    'vid_' || replace(gen_random_uuid()::text, '-', ''),
    cd."id",
    video_row.video_url,
    (video_row.ord - 1)::integer
FROM "context_document" cd
CROSS JOIN LATERAL unnest(cd."videos") WITH ORDINALITY AS video_row(video_url, ord);

ALTER TABLE "context_document" DROP COLUMN "images";
ALTER TABLE "context_document" DROP COLUMN "videos";
