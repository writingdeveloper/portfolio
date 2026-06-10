import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

// The Keystatic admin UI must never be crawled or indexed; everything else is
// open. AI crawlers are listed explicitly (not just covered by '*') to make the
// GEO stance unambiguous — this site publishes /llms.txt for them.
const DISALLOW = ['/keystatic', '/api/keystatic']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ClaudeBot',
          'Claude-Web',
          'PerplexityBot',
          'Google-Extended',
          'CCBot',
        ],
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
