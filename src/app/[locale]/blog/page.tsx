import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllPosts, getCategories } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'
import type { PostMeta } from '@/lib/mdx'
import { PostCard } from '@/components/blog/PostCard'
import { CategoryFilter } from '@/components/blog/CategoryFilter'
import { PageTransition } from '@/components/ui/PageTransition'

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
    openGraph: { url: pageUrl },
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
  searchParams: Promise<{ category?: string }>
}) {
  const { locale } = await params
  const { category } = await searchParams
  setRequestLocale(locale)

  const allPosts = getAllPosts()
  const categories = getCategories()
  const posts = category
    ? allPosts.filter((p) => p.category === category)
    : allPosts

  return <BlogContent posts={posts} categories={categories} activeCategory={category || null} />
}

function BlogContent({ posts, categories, activeCategory }: { posts: PostMeta[]; categories: string[]; activeCategory: string | null }) {
  const t = useTranslations('blog')

  return (
    <PageTransition>
      <div>
        <header className="mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-400">{t('description')}</p>
        </header>

        {categories.length > 0 && (
          <CategoryFilter categories={categories} activeCategory={activeCategory} />
        )}

        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">{t('noPosts')}</p>
        )}
      </div>
    </PageTransition>
  )
}
