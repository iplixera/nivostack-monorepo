import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

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

export default withNextIntl(nextConfig)

