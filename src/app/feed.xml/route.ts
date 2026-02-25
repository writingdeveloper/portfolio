import { getAllPosts } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'

export async function GET() {
  const koPosts = getAllPosts('ko')
  const enPosts = getAllPosts('en')
  const allPosts = [...koPosts, ...enPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  const items = allPosts
    .map((post) => {
      const link = post.language === 'ko'
        ? `${SITE_URL}/blog/${post.slug}`
        : `${SITE_URL}/en/blog/${post.slug}`
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      ${post.category ? `<category>${post.category}</category>` : ''}
      <dc:language>${post.language}</dc:language>
    </item>`
    })
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>WritingDeveloper</title>
    <link>${SITE_URL}</link>
    <description>Dev stories, tech tutorials, and startup journey</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
