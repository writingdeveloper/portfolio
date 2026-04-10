import { getAllPosts } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'

// Revalidate every hour
export const revalidate = 3600

export async function GET() {
  const koPosts = getAllPosts('ko')
  const enPosts = getAllPosts('en')

  const content = `# WritingDeveloper

> Personal blog and portfolio by Si Hyeong Lee (이시형) — Developer & Entrepreneur.
> Dev stories, tech tutorials, and startup journey.

## About

- [About (Korean)](${SITE_URL}/about): Developer and entrepreneur building products with technology.
- [About (English)](${SITE_URL}/en/about): Developer and entrepreneur building products with technology.

## Blog Posts (Korean)

${koPosts.map((post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.excerpt}`).join('\n')}

## Blog Posts (English)

${enPosts.map((post) => `- [${post.title}](${SITE_URL}/en/blog/${post.slug}): ${post.excerpt}`).join('\n')}

## Projects

- [Soursea](https://soursea.com): AI-powered e-commerce sourcing assistant. Analyzes products from Alibaba/1688 and calculates profitability.

## Technical Stack

React, Next.js, TypeScript, Tailwind CSS, Electron, NestJS, Node.js, Supabase, PostgreSQL

## Links

- Website: ${SITE_URL}
- RSS Feed: ${SITE_URL}/feed.xml
- Sitemap: ${SITE_URL}/sitemap.xml
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
