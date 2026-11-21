import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML in out/, served by Cloudflare Workers static assets (ADR-0007).
  output: "export",
  // The image optimizer needs a Next.js server, which a static export lacks.
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
