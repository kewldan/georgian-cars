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
      { protocol: "https", hostname: "**.basemaps.cartocdn.com" },
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
