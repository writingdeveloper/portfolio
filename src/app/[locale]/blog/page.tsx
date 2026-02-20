import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { getAllPosts, getCategories } from '@/lib/mdx'
import { PostCard } from '@/components/blog/PostCard'
import { PageTransition } from '@/components/ui/PageTransition'

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

function BlogContent({ posts, categories }: { posts: any[]; categories: string[] }) {
  const t = useTranslations('blog')

  return (
    <PageTransition>
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
            {categories.map((cat) => (
              <span key={cat} className="px-3 py-1.5 rounded-full text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer transition-colors">
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
