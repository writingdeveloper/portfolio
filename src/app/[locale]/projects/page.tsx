import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import projectsData from '../../../../content/projects.json'
import type { Project } from '@/types/content'
import { SITE_URL } from '@/lib/constants'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { PageTransition } from '@/components/ui/PageTransition'
import { generateBreadcrumbJsonLd, generateProjectListJsonLd, safeJsonLd, toAbsoluteUrl } from '@/lib/seo'
import { APP_CATEGORY, partitionProjects } from '@/lib/projects'
import { getAllPosts } from '@/lib/mdx'
import { buildProjectPostMap, type LinkedPost } from '@/lib/post-project-links'
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
  // The search title is separate from t('title'), which is also the visible h1:
  // "프로젝트 | WritingDeveloper" gives a searcher no reason to click. The count
  // comes from the data so it can never drift the way a written-in number did.
  const count = projectsData.projects.length
  return {
    title: t('metaTitle', { count }),
    description: t('metaDescription', { count }),
    openGraph: {
      url: pageUrl,
      title: t('metaTitle', { count }),
      description: t('metaDescription', { count }),
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

  // Reading posts needs the filesystem, so the lookup is built here and handed
  // down rather than inside ProjectsContent.
  const projectPosts = buildProjectPostMap(
    getAllPosts(locale),
    (projectsData.projects as Project[]).map((p) => p.slug),
  )

  return <ProjectsContent projectPosts={projectPosts} />
}

function ProjectsContent({ projectPosts }: { projectPosts: Map<string, LinkedPost> }) {
  const t = useTranslations('projects')
  const locale = useLocale()
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: locale === 'ko' ? '홈' : 'Home', url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}` },
    { name: locale === 'ko' ? '프로젝트' : 'Projects', url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}/projects` },
  ])
  const { selected, rest } = partitionProjects(projectsData.projects as Project[])
  const allProjects = [...selected, ...rest]
  const projectListJsonLd = generateProjectListJsonLd(
    allProjects.map((project) => ({
      name: project.name,
      description: locale === 'ko' ? project.descriptionKo : project.descriptionEn,
      url: project.website ?? (!project.private && project.github ? project.github : undefined),
      techStack: project.techStack,
      ...(project.screenshot ? { image: toAbsoluteUrl(project.screenshot) } : {}),
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

        <section className="mb-16">
          <div className="mb-6">
            <h2 className="ledger-display text-2xl font-bold">{t('selectedWork')}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('selectedWorkDescription')}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {selected.map((project, index) => (
              <ProjectCard key={project.slug} project={project} priority={index < 2} relatedPost={projectPosts.get(project.slug)} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-6 border-t border-[var(--border-default)] pt-10">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="ledger-display text-2xl font-bold">{t('fullLedger')}</h2>
              <span className="ledger-mono text-xs text-[var(--text-muted)]">{rest.length}</span>
            </div>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('fullLedgerDescription')}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {rest.map((project) => (
              <ProjectCard key={project.slug} project={project} relatedPost={projectPosts.get(project.slug)} />
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
