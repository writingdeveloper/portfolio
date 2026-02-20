import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts()

  const staticPages = ['', '/blog', '/projects', '/about']
  const staticUrls = staticPages.flatMap((page) => [
    {
      url: `${SITE_URL}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' || page === '/blog' ? 'daily' as const : 'monthly' as const,
      priority: page === '' ? 1 : page === '/blog' ? 0.9 : page === '/projects' ? 0.7 : 0.5,
    },
    {
      url: `${SITE_URL}/en${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' || page === '/blog' ? 'daily' as const : 'monthly' as const,
      priority: page === '' ? 1 : page === '/blog' ? 0.9 : page === '/projects' ? 0.7 : 0.5,
    },
  ])

  const postUrls = posts.flatMap((post) => [
    {
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/en/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ])

  return [...staticUrls, ...postUrls]
}
