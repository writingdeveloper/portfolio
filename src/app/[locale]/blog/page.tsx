import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { client } from '@/sanity/lib/client'
import { POSTS_QUERY, CATEGORIES_QUERY } from '@/sanity/lib/queries'
import { PostCard } from '@/components/blog/PostCard'

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [posts, categories] = await Promise.all([
    client.fetch(POSTS_QUERY, { limit: 50 }),
    client.fetch(CATEGORIES_QUERY),
  ])

  return <BlogContent posts={posts} categories={categories} />
}

function BlogContent({ posts, categories }: { posts: any[]; categories: any[] }) {
  const t = useTranslations('blog')

  return (
    <div>
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-400">{t('description')}</p>
      </header>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="px-3 py-1.5 rounded-full text-sm bg-blue-500/20 text-blue-400 cursor-pointer">
            {t('allCategories')}
          </span>
          {categories.map((cat: any) => (
            <span key={cat._id} className="px-3 py-1.5 rounded-full text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer transition-colors">
              {cat.title}
            </span>
          ))}
        </div>
      )}

      {posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-12">{t('noPosts')}</p>
      )}
    </div>
  )
}
