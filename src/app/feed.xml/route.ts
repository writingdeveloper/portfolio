import { getAllPosts } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'
import type { NextRequest } from 'next/server'

// Revalidate every hour
export const revalidate = 3600

function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c] ?? c
  )
}

function escapeCdata(s: string): string {
  return s.replace(/\]\]>/g, ']]]]><![CDATA[>')
}

function generateRss(posts: ReturnType<typeof getAllPosts>, lang?: string) {
  const items = posts
    .map((post) => {
      const link = post.language === 'ko'
        ? `${SITE_URL}/blog/${post.slug}`
        : `${SITE_URL}/en/blog/${post.slug}`
      return `
    <item>
      <title><![CDATA[${escapeCdata(post.title)}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${escapeCdata(post.excerpt || '')}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ''}
      <author>noreply@writingdeveloper.blog (${escapeXml(post.author || 'WritingDeveloper')})</author>
      <dc:creator><![CDATA[${escapeCdata(post.author || 'WritingDeveloper')}]]></dc:creator>
      <dc:language>${post.language}</dc:language>
    </item>`
    })
    .join('')

  const feedLang = lang || 'en'
  const feedPath = lang ? `/${lang}/feed.xml` : '/feed.xml'

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>WritingDeveloper</title>
    <link>${SITE_URL}</link>
    <description>Dev stories, tech tutorials, and startup journey</description>
    <language>${feedLang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}${feedPath}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lang = searchParams.get('lang')

  let posts
  if (lang === 'ko') {
    posts = getAllPosts('ko')
  } else if (lang === 'en') {
    posts = getAllPosts('en')
  } else {
    const koPosts = getAllPosts('ko')
    const enPosts = getAllPosts('en')
    posts = [...koPosts, ...enPosts].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  }

  return new Response(generateRss(posts, lang || undefined), {
    headers: {
      'Content-Type': 'application/rss+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
