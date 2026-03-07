import type { Metadata } from 'next'
import { useTranslations, useLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllPosts, getCategories, getAllTags } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'
import type { PostMeta, CategoryItem } from '@/lib/mdx'
import { PostCard } from '@/components/blog/PostCard'
import { CategoryFilter } from '@/components/blog/CategoryFilter'
import { PageTransition } from '@/components/ui/PageTransition'
import { generateBreadcrumbJsonLd } from '@/lib/seo'
import { Globe } from 'lucide-react'
import { SearchBar } from '@/components/blog/SearchBar'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })
  const localePath = locale === 'ko' ? '' : `/${locale}`
  const pageUrl = `${SITE_URL}${localePath}/blog`
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      url: pageUrl,
      title: t('title'),
      description: t('description'),
      images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(t('title'))}&description=${encodeURIComponent(t('description'))}`, width: 1200, height: 630, alt: t('title') }],
    },
    alternates: {
      canonical: pageUrl,
      languages: { ko: `${SITE_URL}/blog`, en: `${SITE_URL}/en/blog`, 'x-default': `${SITE_URL}/blog` },
    },
  }
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; tag?: string }>
}) {
  const { locale } = await params
  const { category, tag } = await searchParams
  setRequestLocale(locale)

  const allPosts = getAllPosts(locale)
  const categories = getCategories(locale)
  const validCategory = category && categories.some((c) => c.value === category) ? category : null
  const posts = validCategory
    ? allPosts.filter((p) => p.category === validCategory)
    : allPosts

  const filteredPosts = tag
    ? posts.filter((p) => p.tags.includes(tag))
    : posts

  const allTags = getAllTags(locale)

  return <BlogContent posts={filteredPosts} allPosts={allPosts} categories={categories} activeCategory={validCategory} activeTag={tag || null} />
}

function BlogContent({ posts, allPosts, categories, activeCategory, activeTag }: { posts: PostMeta[]; allPosts: PostMeta[]; categories: CategoryItem[]; activeCategory: string | null; activeTag: string | null }) {
  const t = useTranslations('blog')
  const locale = useLocale()
  const categoryMap = Object.fromEntries(categories.map((c) => [c.value, c.label]))
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: locale === 'ko' ? '홈' : 'Home', url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}` },
    { name: locale === 'ko' ? '블로그' : 'Blog', url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}/blog` },
  ])

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div>
        <header className="mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('title')}</h1>
          <div className="flex items-center justify-between">
            <p className="text-[var(--text-secondary)]">{t('description')}</p>
            <a
              href={locale === 'ko' ? '/en/blog' : '/blog'}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-hover)] hover:text-[var(--text-emphasis)] transition-colors whitespace-nowrap"
            >
              <Globe size={14} />
              {locale === 'ko' ? t('viewEnglishPosts') : t('viewKoreanPosts')}
            </a>
          </div>
        </header>

        <SearchBar posts={allPosts} />

        {categories.length > 0 && (
          <CategoryFilter categories={categories} activeCategory={activeCategory} />
        )}

        {activeTag && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-[var(--text-secondary)]">{t('filterByTag')}:</span>
            <span className="text-sm px-2.5 py-1 rounded-full bg-[var(--accent-bg-active)] text-[var(--accent-text)]">
              #{activeTag}
            </span>
            <a href={activeCategory ? `/blog?category=${activeCategory}` : '/blog'} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-emphasis)] transition-colors">
              ✕ {t('clearFilter')}
            </a>
          </div>
        )}

        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} categoryLabel={categoryMap[post.category]} />
            ))}
          </div>
        ) : (
          <p className="text-[var(--text-muted)] text-center py-12">{t('noPosts')}</p>
        )}
      </div>
    </PageTransition>
  )
}
