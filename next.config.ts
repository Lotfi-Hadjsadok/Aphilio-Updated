import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "playwright",
    "playwright-core",
    // CJS + nested node-fetch; bundling breaks Turbopack’s module runtime in server actions
    "image-to-base64",
  ],
};

export default nextConfig;
