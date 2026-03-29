import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "playwright",
    "playwright-core",
    // CJS + nested node-fetch; bundling breaks Turbopack's module runtime in server actions
    "image-to-base64",
  ],
};

export default withNextIntl(nextConfig);
