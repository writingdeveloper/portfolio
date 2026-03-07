import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Globe } from 'lucide-react'
import type { PostMeta } from '@/lib/mdx'

interface PostCardProps {
  post: PostMeta
  categoryLabel?: string
}

export function PostCard({ post, categoryLabel }: PostCardProps) {
  const locale = useLocale()
  const t = useTranslations('blog')

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden hover:border-[var(--border-hover)] focus-within:border-[var(--border-hover)] transition-all hover:-translate-y-1">
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            {post.category && (
              <span className="text-xs text-[var(--accent-text)] font-medium">
                {categoryLabel || post.category}
              </span>
            )}
            {post.hasTranslation && (
              <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)]">
                <Globe size={10} />
                {t('translationAvailable')}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--accent-text)] transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-muted)]">
            <time dateTime={post.publishedAt}>
              {isNaN(new Date(post.publishedAt).getTime()) ? post.publishedAt : new Date(post.publishedAt).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
            </time>
            <span>{t('minRead', { minutes: post.readingTimeMinutes })}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
