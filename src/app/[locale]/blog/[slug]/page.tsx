import { setRequestLocale } from 'next-intl/server'
import { client } from '@/sanity/lib/client'
import { POST_BY_SLUG_QUERY, ALL_POST_SLUGS_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { PortableTextRenderer } from '@/components/portable-text/PortableTextRenderer'
import { generateArticleJsonLd } from '@/lib/seo'
import { PageTransition } from '@/components/ui/PageTransition'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const slugs = await client.fetch(ALL_POST_SLUGS_QUERY)
  return slugs.map((s: { slug: string }) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug })
  if (!post) return {}

  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      ...(post.mainImage && {
        images: [urlFor(post.mainImage).width(1200).height(630).url()],
      }),
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug })
  if (!post) notFound()

  const jsonLd = generateArticleJsonLd({
    title: post.title,
    description: post.excerpt || '',
    url: `https://writingdeveloper.blog/blog/${slug}`,
    imageUrl: post.mainImage ? urlFor(post.mainImage).width(1200).height(630).url() : undefined,
    publishedAt: post.publishedAt || '',
    authorName: post.author?.name || 'WritingDeveloper',
  })

  return (
    <PageTransition>
      <article className="max-w-3xl mx-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <header className="mb-10">
          {post.categories && post.categories.length > 0 && (
            <div className="flex gap-2 mb-4">
              {post.categories.map((cat: any) => (
                <span key={cat._id} className="text-sm text-blue-400 font-medium">
                  {cat.title}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {post.author && <span>{post.author.name}</span>}
            {post.publishedAt && (
              <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
            )}
          </div>
        </header>

        {post.mainImage && (
          <div className="mb-10 rounded-xl overflow-hidden">
            <Image
              src={urlFor(post.mainImage).width(1200).height(630).url()}
              alt={post.mainImage.alt || post.title}
              width={1200}
              height={630}
              className="w-full h-auto"
              priority
            />
          </div>
        )}

        {post.body && <PortableTextRenderer value={post.body} />}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-800">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </PageTransition>
  )
}
