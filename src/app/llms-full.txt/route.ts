import { getAllPosts, getPost } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'

// Revalidate every hour, same cadence as llms.txt.
export const revalidate = 3600

/** llms-full.txt — the full-text companion to /llms.txt.
 *  AI crawlers that want to quote or reason over the actual writing get the
 *  complete MDX body of every post here, instead of just titles + excerpts. */
export async function GET() {
  const sections: string[] = []

  for (const locale of ['ko', 'en'] as const) {
    const posts = getAllPosts(locale)
    sections.push(`# Blog Posts (${locale === 'ko' ? 'Korean' : 'English'})`)
    for (const meta of posts) {
      const post = getPost(meta.slug, locale)
      if (!post) continue
      const url =
        locale === 'ko'
          ? `${SITE_URL}/blog/${meta.slug}`
          : `${SITE_URL}/en/blog/${meta.slug}`
      const dates = `Published: ${meta.publishedAt}${meta.updatedAt ? ` | Updated: ${meta.updatedAt}` : ''}`
      sections.push(
        `## ${post.title}\n\nURL: ${url}\n${dates}\nAuthor: ${post.author}\n\n${post.content.trim()}`
      )
    }
  }

  const content = `# WritingDeveloper — Full Content

> Full-text version of every blog post by Si Hyeong Lee (이시형). For a compact
> index (posts, projects, links), see ${SITE_URL}/llms.txt

${sections.join('\n\n---\n\n')}
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
