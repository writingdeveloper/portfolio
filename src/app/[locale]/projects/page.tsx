import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import projectsData from '../../../../content/projects.json'
import type { Project } from '@/types/content'
import { SITE_URL } from '@/lib/constants'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { PageTransition } from '@/components/ui/PageTransition'
import { generateBreadcrumbJsonLd, generateProjectListJsonLd, safeJsonLd } from '@/lib/seo'
import { sortProjectsFeaturedFirst } from '@/lib/projects'
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
    description: t('metaDescription'),
    openGraph: {
      url: pageUrl,
      title: t('title'),
      description: t('metaDescription'),
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
  // schema.org applicationCategory per shipped app (defaults to Lifestyle in seo.ts).
  const APP_CATEGORY: Record<string, string> = {
    drymora: 'HealthApplication',
    healframe: 'HealthApplication',
    'receipt-tracker': 'FinanceApplication',
  }
  const allProjects = sortProjectsFeaturedFirst(projectsData.projects as Project[])
  const projectListJsonLd = generateProjectListJsonLd(
    allProjects.map((project) => ({
      name: project.name,
      description: locale === 'ko' ? project.descriptionKo : project.descriptionEn,
      url: project.website ?? (!project.private && project.github ? project.github : undefined),
      techStack: project.techStack,
      ...(project.playStore ? { playStore: project.playStore, appCategory: APP_CATEGORY[project.slug] } : {}),
    })),
    locale,
  )

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(projectListJsonLd) }}
      />
      <div>
        <header className="mb-12">
          <h1 className="ledger-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">{t('title')}</h1>
          <p className="text-[var(--text-secondary)]">{t('description')}</p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {allProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
