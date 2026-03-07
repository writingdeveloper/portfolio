import type { MetadataRoute } from 'next'
import { getAllPosts, hasTranslation } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const buildDate = new Date().toISOString()
  const koPosts = getAllPosts('ko')
  const enPosts = getAllPosts('en')

  const staticPages = ['', '/blog', '/projects', '/about']

  // 한국어 + 영어 정적 페이지 모두 등록
  const staticUrls = staticPages.flatMap((page) => {
    const changeFrequency = page === '' || page === '/blog' ? 'daily' as const : 'monthly' as const
    const priority = page === '' ? 1 : page === '/blog' ? 0.9 : page === '/projects' ? 0.7 : 0.5
    const alternates = {
      languages: {
        ko: `${SITE_URL}${page}`,
        en: `${SITE_URL}/en${page}`,
        'x-default': `${SITE_URL}${page}`,
      },
    }

    return [
      {
        url: `${SITE_URL}${page}`,
        lastModified: buildDate,
        changeFrequency,
        priority,
        alternates,
      },
      {
        url: `${SITE_URL}/en${page}`,
        lastModified: buildDate,
        changeFrequency,
        priority: Math.max(priority - 0.1, 0.5),
        alternates,
      },
    ]
  })

  // 한국어 블로그 포스트
  const koPostUrls = koPosts.map((post) => {
    const hasEn = hasTranslation(post.slug, 'ko')
    const languages: Record<string, string> = {
      ko: `${SITE_URL}/blog/${post.slug}`,
      'x-default': `${SITE_URL}/blog/${post.slug}`,
    }
    if (hasEn) {
      languages.en = `${SITE_URL}/en/blog/${post.slug}`
    }

    return {
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: { languages },
    }
  })

  // 영어 블로그 포스트
  const enPostUrls = enPosts.map((post) => {
    const hasKo = hasTranslation(post.slug, 'en')
    const languages: Record<string, string> = {
      en: `${SITE_URL}/en/blog/${post.slug}`,
    }
    if (hasKo) {
      languages.ko = `${SITE_URL}/blog/${post.slug}`
      languages['x-default'] = `${SITE_URL}/blog/${post.slug}`
    } else {
      languages['x-default'] = `${SITE_URL}/en/blog/${post.slug}`
    }

    return {
      url: `${SITE_URL}/en/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: { languages },
    }
  })

  return [...staticUrls, ...koPostUrls, ...enPostUrls]
}
