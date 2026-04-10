import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SITE_URL } from '@/lib/constants'
import { getAllPosts } from '@/lib/mdx'
import projectsData from '../../../../content/projects.json'
import aboutData from '../../../../content/about.json'
import type { Project, Skill, TimelineItem } from '@/types/content'
import { PlayLoader } from './PlayLoader'
import { PlaySemanticFallback } from './PlaySemanticFallback'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'play' })
  const localePath = locale === 'ko' ? '' : `/${locale}`
  const pageUrl = `${SITE_URL}${localePath}/play`

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      url: pageUrl,
      title: t('title'),
      description: t('description'),
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        ko: `${SITE_URL}/play`,
        en: `${SITE_URL}/en/play`,
      },
    },
  }
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const projects = projectsData.projects as Project[]
  const skills = aboutData.skills as Skill[]
  const timeline = aboutData.timeline as TimelineItem[]
  const posts = getAllPosts(locale)
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      publishedAt: p.publishedAt,
      category: p.category,
    }))

  return (
    <>
      <PlaySemanticFallback
        projects={projects}
        skills={skills}
        timeline={timeline}
        posts={posts}
        locale={locale}
      />
      <PlayLoader
        projects={projects}
        skills={skills}
        timeline={timeline}
        posts={posts}
        locale={locale}
      />
    </>
  )
}
