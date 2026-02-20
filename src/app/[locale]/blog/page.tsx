import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllPosts, getCategories } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'
import type { PostMeta } from '@/lib/mdx'
import { PostCard } from '@/components/blog/PostCard'
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
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const posts = getAllPosts()
  const categories = getCategories()

  return <BlogContent posts={posts} categories={categories} />
}

function BlogContent({ posts, categories }: { posts: PostMeta[]; categories: string[] }) {
  const t = useTranslations('blog')

  return (
    <PageTransition>
      <div>
        <header className="mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-400">{t('description')}</p>
        </header>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <span key={cat} className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
                {cat}
              </span>
            ))}
          </div>
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
