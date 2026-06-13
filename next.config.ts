import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Don't advertise the framework to probes.
  poweredByHeader: false,
  outputFileTracingIncludes: {
    '/api/content-image/\\[...path\\]': ['./content/posts/**/*'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Serve content images from the same-origin API route through the image optimizer.
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  async redirects() {
    // Lock down the local-mode Keystatic CMS on production. It can't function
    // on Vercel's read-only FS and would otherwise expose its admin UI to
    // anonymous visitors. Bounce /keystatic to home in production unless GitHub
    // storage (which enforces its own OAuth) is configured. This runs at the
    // platform routing layer, so it's guaranteed regardless of middleware/route
    // quirks; dev is untouched so local editing at /keystatic still works.
    // (The /api/keystatic handler and a page-level guard provide defense in depth.)
    // Gate on VERCEL (always injected during a Vercel build) rather than
    // NODE_ENV, which isn't reliably 'production' when next.config is evaluated.
    const onVercel = process.env.VERCEL === '1'
    const hasGitHubStorage = Boolean(process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG)
    if (onVercel && !hasGitHubStorage) {
      return [
        { source: '/keystatic', destination: '/', permanent: false },
        { source: '/keystatic/:path*', destination: '/', permanent: false },
      ]
    }
    return []
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Content-Security-Policy is set dynamically in src/middleware.ts
          // with a per-request nonce (removes the need for 'unsafe-inline' and 'unsafe-eval').
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
};

export default withNextIntl(nextConfig);
