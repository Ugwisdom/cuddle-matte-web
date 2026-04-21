import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Ensure Turbopack uses this folder as the workspace root.
  // This silences the warning about Next.js inferring the wrong workspace root
  // when multiple lockfiles are present on parent folders.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Production optimization settings
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,

  // Image optimization for better performance
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },

  // Redirects for common paths
  async redirects() {
    return [];
  },

  // Rewrites for API routes
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },

  // SWR (Stale-While-Revalidate) for static pages
  // This allows pages to be cached and updated in the background
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  },

  // Experimental features that improve performance
  experimental: {
    optimizePackageImports: ["@tailwindcss/postcss"],
  },
};

export default nextConfig;
