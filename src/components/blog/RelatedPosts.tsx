import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import type { PostMeta } from '@/lib/mdx'

interface RelatedPostsProps {
  posts: PostMeta[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  const t = useTranslations('blog')
  const locale = useLocale()

  if (posts.length === 0) return null

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border-default)]">
      <h2 className="text-lg font-bold mb-4">{t('relatedPosts')}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <div className="p-4 rounded-lg border border-[var(--border-default)] hover:border-[var(--border-hover)] transition-colors">
              <h3 className="font-medium text-sm mb-1 line-clamp-2">{post.title}</h3>
              <p className="text-xs text-[var(--text-muted)]">
                {new Date(post.publishedAt).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
