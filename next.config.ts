import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Silence monorepo lockfile warning — this app's root is its own directory
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
