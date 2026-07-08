import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllPosts } from '@/lib/mdx'
import projectsData from '../../../content/projects.json'
import graveyardData from '../../../content/graveyard.json'
import type { Project, Tombstone } from '@/types/content'
import { LedgerHome } from './LedgerHome'
import { generateWebsiteJsonLd, safeJsonLd } from '@/lib/seo'
import { SITE_URL, SITE_NAME } from '@/lib/constants'
import type { Metadata } from 'next'

// Revalidate every hour — home page reads the MDX cache + static JSON.
export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  const localePath = locale === 'ko' ? '' : `/${locale}`
  const pageUrl = `${SITE_URL}${localePath}`
  return {
    title: { absolute: `${t('hero.name')} - ${t('hero.role')} | ${SITE_NAME}` },
    description: t('metaDescription'),
    openGraph: {
      url: pageUrl,
      title: `${t('hero.name')} - ${t('hero.role')}`,
      description: t('metaDescription'),
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      alternateLocale: locale === 'ko' ? ['en_US'] : ['ko_KR'],
      type: 'website',
      images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(t('hero.name'))}&description=${encodeURIComponent(t('hero.role'))}`, width: 1200, height: 630, alt: t('hero.name') }],
    },
    alternates: {
      canonical: pageUrl,
      languages: { ko: SITE_URL, en: `${SITE_URL}/en`, 'x-default': SITE_URL },
    },
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const posts = getAllPosts(locale).slice(0, 3)
  const projects = projectsData.projects as Project[]
  const tombstones = graveyardData.tombstones as Tombstone[]
  const webSiteJsonLd = generateWebsiteJsonLd(locale)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(webSiteJsonLd) }}
      />
      <LedgerHome projects={projects} tombstones={tombstones} posts={posts} locale={locale} />
    </>
  )
}
