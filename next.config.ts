import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Point to monorepo root for output file tracing
  outputFileTracingRoot: path.join(__dirname, "../../.."),
  webpack: (config, { isServer }) => {
    // Use memory cache to avoid Windows atomic rename failures on the pack files
    config.cache = { type: "memory" };
    return config;
  },
};

export default nextConfig;
