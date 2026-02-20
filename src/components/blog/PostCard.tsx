import { Link } from '@/i18n/navigation'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'

interface PostCardProps {
  post: {
    _id: string
    title: string
    slug: { current: string }
    excerpt?: string
    publishedAt?: string
    mainImage?: any
    categories?: { title: string }[]
    tags?: string[]
  }
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/blog/${post.slug.current}`}>
      <article className="group rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden hover:border-gray-700 transition-all hover:-translate-y-1">
        {post.mainImage && (
          <div className="aspect-[16/9] overflow-hidden">
            <Image
              src={urlFor(post.mainImage).width(600).height(340).url()}
              alt={post.mainImage.alt || post.title}
              width={600}
              height={340}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-5">
          {post.categories && post.categories.length > 0 && (
            <div className="flex gap-2 mb-2">
              {post.categories.map((cat) => (
                <span key={cat.title} className="text-xs text-blue-400 font-medium">
                  {cat.title}
                </span>
              ))}
            </div>
          )}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-gray-400 line-clamp-2">{post.excerpt}</p>
          )}
          {post.publishedAt && (
            <time className="text-xs text-gray-500 mt-3 block">
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
          )}
        </div>
      </article>
    </Link>
  )
}
