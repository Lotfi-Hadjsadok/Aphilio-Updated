import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY are required.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getR2BucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME is required.");
  return bucket;
}

function getR2PublicUrl(): string {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) throw new Error("R2_PUBLIC_URL is required.");
  return publicUrl.replace(/\/$/, "");
}

/**
 * Downloads an image from a URL, converts it to optimised WebP, and uploads
 * it to Cloudflare R2. Returns the public CDN URL and the R2 object key.
 */
export async function uploadImageToR2(params: {
  sourceUrl: string;
  key: string;
  quality?: number;
}): Promise<{ publicUrl: string; key: string }> {
  const { sourceUrl, key, quality = 88 } = params;

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${sourceUrl}: ${response.status}`);
  }

  const rawBuffer = Buffer.from(await response.arrayBuffer());

  const optimisedBuffer = await sharp(rawBuffer)
    .webp({ quality })
    .toBuffer();

  const client = getR2Client();
  const bucket = getR2BucketName();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: optimisedBuffer,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const publicUrl = `${getR2PublicUrl()}/${key}`;
  return { publicUrl, key };
}

/** Removes an object from R2 by its key. */
export async function deleteImageFromR2(key: string): Promise<void> {
  const client = getR2Client();
  const bucket = getR2BucketName();

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

const R2_DELETE_BATCH_SIZE = 1000;

/**
 * Deletes every object whose key starts with `prefix` (must end with `/` for user scoping).
 * Used when removing a user’s chat and creative uploads from R2 before deleting their DB row.
 */
export async function deleteAllR2ObjectsUnderPrefix(prefix: string): Promise<void> {
  const client = getR2Client();
  const bucket = getR2BucketName();
  let continuationToken: string | undefined;

  for (;;) {
    const listBatch = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: R2_DELETE_BATCH_SIZE,
      }),
    );

    const objectKeys = (listBatch.Contents ?? [])
      .map((item) => item.Key)
      .filter((key): key is string => Boolean(key));

    if (objectKeys.length > 0) {
      const deleteBatch = await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: objectKeys.map((objectKey) => ({ Key: objectKey })),
            Quiet: true,
          },
        }),
      );

      const deleteFailures = deleteBatch.Errors ?? [];
      if (deleteFailures.length > 0) {
        const firstCode = deleteFailures[0]?.Code ?? "Unknown";
        const firstMessage = deleteFailures[0]?.Message ?? "";
        throw new Error(
          `R2 bulk delete failed (${firstCode}${firstMessage ? `: ${firstMessage}` : ""}).`,
        );
      }
    }

    if (!listBatch.IsTruncated || !listBatch.NextContinuationToken) {
      break;
    }

    continuationToken = listBatch.NextContinuationToken;
  }
}

/**
 * Removes all R2 uploads for a user (chat images, reference uploads, and ad creatives).
 */
export async function deleteAllR2ObjectsForUser(userId: string): Promise<void> {
  await Promise.all([
    deleteAllR2ObjectsUnderPrefix(`chat/${userId}/`),
    deleteAllR2ObjectsUnderPrefix(`creatives/${userId}/`),
  ]);
}
