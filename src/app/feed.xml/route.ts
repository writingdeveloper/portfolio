import fs from 'fs'
import path from 'path'
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

/**
 * Byte size of a public/ asset, or null when it cannot be read.
 *
 * Next traces the files a route actually reads, and `public/` is served by the
 * CDN rather than bundled into the function — so this may legitimately fail at
 * runtime even though it works locally. Returning null instead of throwing
 * keeps a missing stat from turning the whole feed into a 500.
 */
function publicAssetBytes(publicPath: string): number | null {
  try {
    return fs.statSync(path.join(process.cwd(), 'public', publicPath)).size
  } catch {
    return null
  }
}

const IMAGE_MIME: Record<string, string> = {
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

/**
 * Cover image markup for one item.
 *
 * Two elements on purpose: <enclosure> is the RSS 2.0 way and what older
 * readers look for, but its `length` is required, so it is only emitted when
 * the size is actually known. <media:content> carries no such requirement and
 * is what Feedly and Inoreader read, so it always goes out.
 */
function coverImageXml(coverImage: string, coverImageAlt: string): string {
  if (!coverImage) return ''

  const type = IMAGE_MIME[path.extname(coverImage).toLowerCase()]
  if (!type) return ''

  const url = `${SITE_URL}${coverImage}`
  const bytes = publicAssetBytes(coverImage)
  const enclosure = bytes === null
    ? ''
    : `\n      <enclosure url="${escapeXml(url)}" length="${bytes}" type="${type}"/>`

  return `${enclosure}
      <media:content url="${escapeXml(url)}" medium="image" type="${type}">
        ${coverImageAlt ? `<media:description type="plain"><![CDATA[${escapeCdata(coverImageAlt)}]]></media:description>` : ''}
      </media:content>`
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
      <dc:language>${post.language}</dc:language>${coverImageXml(post.coverImage, post.coverImageAlt)}
    </item>`
    })
    .join('')

  const feedLang = lang || 'en'
  const feedPath = lang ? `/${lang}/feed.xml` : '/feed.xml'

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
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
