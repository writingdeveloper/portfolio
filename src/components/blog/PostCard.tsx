import { Link } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import type { PostMeta } from '@/lib/mdx'

interface PostCardProps {
  post: PostMeta
}

export function PostCard({ post }: PostCardProps) {
  const locale = useLocale()

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden hover:border-gray-700 transition-all hover:-translate-y-1">
        <div className="p-4 sm:p-5">
          {post.category && (
            <span className="text-xs text-blue-400 font-medium mb-2 block">
              {post.category}
            </span>
          )}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-gray-400 line-clamp-2">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
            </time>
            <span>{post.readingTime}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
