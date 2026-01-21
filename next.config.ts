import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // other config options here
  // reactCompiler: true, // not present in Next.js 15
};

export default nextConfig;
