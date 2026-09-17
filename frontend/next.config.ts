import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" produces a self-contained server.js for the Docker image
  // (see frontend/Dockerfile). Vercel has its own build/deploy pipeline and
  // doesn't need or want this mode, so skip it when building there.
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
