import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Real listing photos: replace with the host(s) the API returns.
      // { protocol: "https", hostname: "cdn.your-domain.tld" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.basemaps.cartocdn.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
