import { setRequestLocale } from 'next-intl/server'
import { getPost, getAllSlugs, extractHeadings } from '@/lib/mdx'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { mdxComponents } from '@/components/mdx/MdxComponents'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { generateArticleJsonLd } from '@/lib/seo'
import { PageTransition } from '@/components/ui/PageTransition'
import { SITE_URL, SITE_NAME } from '@/lib/constants'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const post = getPost(slug)
  if (!post) return {}

  const url = locale === 'ko' ? `${SITE_URL}/blog/${slug}` : `${SITE_URL}/${locale}/blog/${slug}`
  const ogImage = post.coverImage || `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.excerpt || '')}`
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      url,
      siteName: SITE_NAME,
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        ko: `${SITE_URL}/blog/${slug}`,
        en: `${SITE_URL}/en/blog/${slug}`,
        'x-default': `${SITE_URL}/blog/${slug}`,
      },
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const post = getPost(slug)
  if (!post) notFound()

  const headings = extractHeadings(post.content)
  const postUrl = locale === 'ko' ? `${SITE_URL}/blog/${slug}` : `${SITE_URL}/${locale}/blog/${slug}`

  const jsonLd = generateArticleJsonLd({
    title: post.title,
    description: post.excerpt,
    url: postUrl,
    publishedAt: post.publishedAt,
    authorName: post.author,
  })

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-[1fr_200px] lg:gap-8">
        <article>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <header className="mb-10">
            {post.category && (
              <span className="text-sm text-blue-400 font-medium mb-4 block">
                {post.category}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{post.author}</span>
              <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}</time>
              <span>{post.readingTime}</span>
            </div>
          </header>

          {/* Mobile TOC */}
          <div className="lg:hidden">
            <TableOfContents headings={headings} />
          </div>

          <div className="prose-content">
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>

          {post.tags?.length > 0 && (
            <div className="mt-12 pt-6 border-t border-gray-800">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <ShareButtons
            url={postUrl}
            title={post.title}
          />
        </article>

        {/* Desktop TOC */}
        <TableOfContents headings={headings} />
      </div>
    </PageTransition>
  )
}
