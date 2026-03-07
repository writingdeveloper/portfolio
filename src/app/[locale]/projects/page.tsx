import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { projects } from '../../../../content/projects'
import { SITE_URL } from '@/lib/constants'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { PageTransition } from '@/components/ui/PageTransition'
import { generateBreadcrumbJsonLd } from '@/lib/seo'
import { useLocale } from 'next-intl'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'projects' })
  const localePath = locale === 'ko' ? '' : `/${locale}`
  const pageUrl = `${SITE_URL}${localePath}/projects`
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      url: pageUrl,
      title: t('title'),
      description: t('description'),
      images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(t('title'))}&description=${encodeURIComponent(t('description'))}`, width: 1200, height: 630, alt: t('title') }],
    },
    alternates: {
      canonical: pageUrl,
      languages: { ko: `${SITE_URL}/projects`, en: `${SITE_URL}/en/projects`, 'x-default': `${SITE_URL}/projects` },
    },
  }
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <ProjectsContent />
}

function ProjectsContent() {
  const t = useTranslations('projects')
  const locale = useLocale()
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: locale === 'ko' ? '홈' : 'Home', url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}` },
    { name: locale === 'ko' ? '프로젝트' : 'Projects', url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}/projects` },
  ])

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div>
        <header className="mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-[var(--text-secondary)]">{t('description')}</p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
