import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPost, getAllSlugs, extractHeadings, getCategoryLabel } from '@/lib/mdx'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { createMdxComponents } from '@/components/mdx/MdxComponents'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { generateArticleJsonLd, generateBreadcrumbJsonLd, generateFaqJsonLd } from '@/lib/seo'
import { PageTransition } from '@/components/ui/PageTransition'
import { SITE_URL, SITE_NAME } from '@/lib/constants'
import { Globe } from 'lucide-react'
import type { Metadata } from 'next'

function getOgImageUrl(post: { coverImage: string; title: string; excerpt: string }) {
  if (post.coverImage) {
    return post.coverImage.startsWith('http') ? post.coverImage : `${SITE_URL}${post.coverImage}`
  }
  const title = post.title.length > 60 ? post.title.slice(0, 57) + '...' : post.title
  const desc = (post.excerpt || '').length > 100 ? (post.excerpt || '').slice(0, 97) + '...' : (post.excerpt || '')
  return `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(desc)}`
}

export function generateStaticParams() {
  const koSlugs = getAllSlugs('ko').map((slug) => ({ slug }))
  const enSlugs = getAllSlugs('en').map((slug) => ({ slug }))
  return [...koSlugs, ...enSlugs]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const post = getPost(slug, locale)
  if (!post) return {}

  const url = locale === 'ko' ? `${SITE_URL}/blog/${slug}` : `${SITE_URL}/${locale}/blog/${slug}`
  const ogImage = getOgImageUrl(post)

  const languages: Record<string, string> = {
    ko: `${SITE_URL}/blog/${slug}`,
    'x-default': `${SITE_URL}/blog/${slug}`,
  }
  if (post.hasTranslation || locale === 'en') {
    languages.en = `${SITE_URL}/en/blog/${slug}`
  }

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
      languages,
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
  const t = await getTranslations({ locale, namespace: 'blog' })

  const post = getPost(slug, locale)
  if (!post) notFound()

  const headings = extractHeadings(post.content)
  const postUrl = locale === 'ko' ? `${SITE_URL}/blog/${slug}` : `${SITE_URL}/${locale}/blog/${slug}`

  const ogImage = getOgImageUrl(post)

  const jsonLd = generateArticleJsonLd({
    title: post.title,
    description: post.excerpt,
    url: postUrl,
    imageUrl: ogImage,
    publishedAt: post.publishedAt,
    authorName: post.author,
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: locale === 'ko' ? '홈' : 'Home', url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}` },
    { name: locale === 'ko' ? '블로그' : 'Blog', url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}/blog` },
    { name: post.title, url: postUrl },
  ])

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-[1fr_200px] lg:gap-8">
        <article>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
          />
          {post.faqs.length > 0 && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFaqJsonLd(post.faqs)) }}
            />
          )}
          <header className="mb-10">
            {post.category && (
              <span className="text-sm text-[var(--accent-text)] font-medium mb-4 block">
                {getCategoryLabel(post.category)}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <span>{post.author}</span>
              <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}</time>
              <span>{post.readingTime}</span>
            </div>
            {post.hasTranslation && (
              <a
                href={locale === 'ko' ? `/en/blog/${slug}` : `/blog/${slug}`}
                className="inline-flex items-center gap-1.5 mt-3 text-sm px-3 py-1.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] hover:bg-[var(--accent-bg-active)] hover:text-[var(--accent-text-hover)] transition-colors"
              >
                <Globe size={14} />
                {locale === 'ko' ? t('readInEnglish') : t('readInKorean')}
              </a>
            )}
          </header>

          {/* Mobile TOC */}
          <div className="lg:hidden">
            <TableOfContents headings={headings} />
          </div>

          <div className="prose-content">
            <MDXRemote source={post.content} components={createMdxComponents()} />
          </div>

          {post.tags?.length > 0 && (
            <div className="mt-12 pt-6 border-t border-[var(--border-default)]">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
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
