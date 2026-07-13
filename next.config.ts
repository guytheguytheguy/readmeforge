import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { isServer }) => {
    // Use memory cache to avoid Windows atomic rename failures on the pack files
    config.cache = { type: "memory" };
    return config;
  },
};

export default nextConfig;
