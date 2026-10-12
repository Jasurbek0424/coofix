import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const apiInternal = (process.env.API_INTERNAL_URL ?? "http://localhost:8000").replace(/\/$/, "");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "coofix.store", pathname: "/media/**" },
      { protocol: "https", hostname: "www.coofix.store", pathname: "/media/**" },
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/media/**" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // In production Caddy routes /api/* to the API container. In dev, Next proxies it so the
  // browser stays same-origin (the refresh cookie is SameSite=Strict, path /api/auth).
  async rewrites() {
    if (!isDev) return [];
    return [{ source: "/api/:path*", destination: `${apiInternal}/api/:path*` }];
  },
};

export default nextConfig;
