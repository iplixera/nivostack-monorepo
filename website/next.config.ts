import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // SEO Optimization
  compress: true,
  poweredByHeader: false,
  // Generate sitemap and robots.txt
  async generateBuildId() {
    return process.env.BUILD_ID || `build-${Date.now()}`
  },
}

export default nextConfig

