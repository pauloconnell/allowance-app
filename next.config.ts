import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Check if we are in development mode
const isDev = process.env.NODE_ENV === "development";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true, // Crucial for navigating records while offline
    disable: isDev, // <--- THIS BREAKS THE LOOP
});


const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // other config options here
  // reactCompiler: true, // not present in Next.js 15
  reactStrictMode: true,

};

export default withSerwist(nextConfig);
