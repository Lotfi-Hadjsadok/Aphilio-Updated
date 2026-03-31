/**
 * Google Analytics runs only when Polar is in production mode (`POLAR_SERVER=production`),
 * same as `lib/polar/client.ts`. Sandbox and local dev must not send measurement data.
 *
 * Server: `POLAR_SERVER`. Client: `NEXT_PUBLIC_POLAR_SERVER` (inlined from `POLAR_SERVER` at build).
 */
export function isGoogleAnalyticsAllowed(): boolean {
  const polarServer =
    process.env.POLAR_SERVER ?? process.env.NEXT_PUBLIC_POLAR_SERVER ?? "sandbox";
  return polarServer === "production";
}
