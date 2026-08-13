import type { MetadataRoute } from 'next'
import { getAllPosts, hasTranslation } from '@/lib/mdx'
import { SITE_URL } from '@/lib/constants'
import { hasIndexablePage } from '@/lib/projects'
import { buildProjectPostMap } from '@/lib/post-project-links'
import { toAbsoluteUrl } from '@/lib/seo'
import projectsData from '../../content/projects.json'
import type { Project } from '@/types/content'

// Revalidate every hour to avoid regenerating the sitemap on every request.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const buildDate = new Date().toISOString()
  const koPosts = getAllPosts('ko')
  const enPosts = getAllPosts('en')

  const staticPages = ['', '/blog', '/projects', '/hire', '/studio', '/graveyard', '/about', '/play']

  // 프로젝트 스크린샷을 /projects 엔트리에 붙여 이미지 사이트맵에 노출한다.
  const projectImages = (projectsData.projects as Project[])
    .filter((p) => p.screenshot)
    .map((p) => toAbsoluteUrl(p.screenshot!))

  // 한국어 + 영어 정적 페이지 모두 등록
  const staticUrls = staticPages.flatMap((page) => {
    const changeFrequency = page === '' || page === '/blog' ? 'daily' as const : 'monthly' as const
    const priority =
      page === ''
        ? 1
        : page === '/blog'
        ? 0.9
        : page === '/projects' || page === '/hire' || page === '/studio'
        ? 0.7
        : page === '/play'
        ? 0.6
        : 0.5
    const alternates = {
      languages: {
        ko: `${SITE_URL}${page}`,
        en: `${SITE_URL}/en${page}`,
        'x-default': `${SITE_URL}${page}`,
      },
    }

    const images = page === '/projects' ? projectImages : []

    return [
      {
        url: `${SITE_URL}${page}`,
        lastModified: buildDate,
        changeFrequency,
        priority,
        ...(images.length ? { images } : {}),
        alternates,
      },
      {
        url: `${SITE_URL}/en${page}`,
        lastModified: buildDate,
        changeFrequency,
        priority: Math.max(priority - 0.1, 0.5),
        ...(images.length ? { images } : {}),
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
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      ...(post.coverImage ? { images: [toAbsoluteUrl(post.coverImage)] } : {}),
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
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      ...(post.coverImage ? { images: [toAbsoluteUrl(post.coverImage)] } : {}),
      alternates: { languages },
    }
  })

  // 프로젝트 상세 페이지. 39개 프로젝트가 /projects 한 장에만 있던 동안에는
  // 각자의 제목·설명·스크린샷으로 검색에 걸릴 수 없었다.
  //
  // 스크린샷도 링크도 딸린 글도 없는 프로젝트는 제외한다 — 페이지는 그대로
  // 살아 있고 /projects에서 닿지만, 색인 가치가 없는 URL을 크롤러에 밀어넣지는
  // 않는다. 판단 기준은 hasIndexablePage() 참고.
  const allProjects = projectsData.projects as Project[]
  const postMap = buildProjectPostMap(
    [...koPosts, ...enPosts],
    allProjects.map((p) => p.slug),
  )
  const projectUrls = allProjects
    .filter((project) => hasIndexablePage(project, postMap.has(project.slug)))
    .flatMap((project) => {
      const languages = {
        ko: `${SITE_URL}/projects/${project.slug}`,
        en: `${SITE_URL}/en/projects/${project.slug}`,
        'x-default': `${SITE_URL}/projects/${project.slug}`,
      }
      const images = project.screenshot ? [toAbsoluteUrl(project.screenshot)] : []

      return [
        {
          url: `${SITE_URL}/projects/${project.slug}`,
          lastModified: buildDate,
          changeFrequency: 'monthly' as const,
          // Featured work outranks the long tail, but every project stays above
          // the 0.5 floor used for the static pages.
          priority: project.featured ? 0.8 : 0.6,
          ...(images.length ? { images } : {}),
          alternates: { languages },
        },
        {
          url: `${SITE_URL}/en/projects/${project.slug}`,
          lastModified: buildDate,
          changeFrequency: 'monthly' as const,
          priority: project.featured ? 0.7 : 0.5,
          ...(images.length ? { images } : {}),
          alternates: { languages },
        },
      ]
    })

  return [...staticUrls, ...projectUrls, ...koPostUrls, ...enPostUrls]
}
