import { client } from '@/sanity/lib/client'

const SITE_URL = 'https://writingdeveloper.blog'

export async function GET() {
  const posts = await client.fetch(
    `*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...50]{
      title,
      slug,
      excerpt,
      publishedAt,
      "author": author->name
    }`
  )

  const items = posts
    .map(
      (post: any) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug.current}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug.current}</guid>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      ${post.author ? `<author>${post.author}</author>` : ''}
    </item>`
    )
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>WritingDeveloper</title>
    <link>${SITE_URL}</link>
    <description>Dev stories, tech tutorials, and startup journey</description>
    <language>ko</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
