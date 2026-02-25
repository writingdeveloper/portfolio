import type { MetadataRoute } from 'next'
import { getAllPosts, hasTranslation } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const koPosts = getAllPosts('ko')
  const enPosts = getAllPosts('en')

  const staticPages = ['', '/blog', '/projects', '/about']
  const staticUrls = staticPages.map((page) => ({
    url: `${SITE_URL}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' || page === '/blog' ? 'daily' as const : 'monthly' as const,
    priority: page === '' ? 1 : page === '/blog' ? 0.9 : page === '/projects' ? 0.7 : 0.5,
    alternates: {
      languages: {
        ko: `${SITE_URL}${page}`,
        en: `${SITE_URL}/en${page}`,
      },
    },
  }))

  const koPostUrls = koPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    ...(hasTranslation(post.slug, 'ko') && {
      alternates: {
        languages: {
          ko: `${SITE_URL}/blog/${post.slug}`,
          en: `${SITE_URL}/en/blog/${post.slug}`,
        },
      },
    }),
  }))

  const enPostUrls = enPosts.map((post) => ({
    url: `${SITE_URL}/en/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    ...(hasTranslation(post.slug, 'en') && {
      alternates: {
        languages: {
          ko: `${SITE_URL}/blog/${post.slug}`,
          en: `${SITE_URL}/en/blog/${post.slug}`,
        },
      },
    }),
  }))

  return [...staticUrls, ...koPostUrls, ...enPostUrls]
}
