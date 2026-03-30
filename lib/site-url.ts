/**
 * Canonical site origin for metadata, Open Graph, sitemap, and robots (no trailing slash).
 * Set NEXT_PUBLIC_APP_URL or BETTER_AUTH_URL in production so previews and SEO use the real domain.
 */
export function getSiteOrigin(): string {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  return "http://localhost:3000";
}
