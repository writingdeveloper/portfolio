import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Globe } from 'lucide-react'
import Image from 'next/image'
import type { PostMeta } from '@/lib/mdx'

interface PostCardProps {
  post: PostMeta
  categoryLabel?: string
  /** Eager-load this card's cover image. Only the cards in the first grid row
   *  should set it: the first cover is the list page's LCP element, and leaving
   *  it lazy costs ~0.5s of load delay. Applying it further down the grid would
   *  make every image compete for bandwidth and undo the gain. */
  priority?: boolean
}

export function PostCard({ post, categoryLabel, priority = false }: PostCardProps) {
  const locale = useLocale()
  const t = useTranslations('blog')

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden hover:border-[var(--border-hover)] focus-within:border-[var(--border-hover)] transition-all hover:-translate-y-1">
        {post.coverImage && (
          <div className="relative aspect-video bg-[var(--bg-elevated)]">
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
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
