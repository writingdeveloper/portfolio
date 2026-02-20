import type { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'

const SITE_URL = 'https://writingdeveloper.blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await client.fetch(
    `*[_type == "post" && defined(slug.current)]{
      "slug": slug.current,
      _updatedAt
    }`
  )

  const postUrls = posts.map((post: any) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/projects`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...postUrls,
  ]
}
