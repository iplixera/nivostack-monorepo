import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Vercel handles the deployment correctly
  reactStrictMode: true,
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
