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
      { protocol: "https", hostname: "**.basemaps.cartocdn.com" },
      // Listing photos served by the backend at /api/images/<id>.webp.
      // photoSrc() in lib/utils.ts prepends NEXT_PUBLIC_SITE_URL so next/image
      // gets an absolute URL — these are the hosts the optimizer will fetch from.
      { protocol: "https", hostname: "cars.kewldan.ru" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  async rewrites() {
    // In dev, the browser hits /api/... — Next forwards to uvicorn on :8080
    // and strips the /api prefix to match FastAPI's /v1 routes. Mirrors what
    // nginx does in production, so the same `/api` paths work in both.
    return [{ source: "/api/:path*", destination: "http://localhost:8080/:path*" }];
  },
};

export default withNextIntl(nextConfig);
