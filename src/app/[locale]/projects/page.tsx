import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { projects } from '../../../../content/projects'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { PageTransition } from '@/components/ui/PageTransition'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'projects' })
  return {
    title: t('title'),
    description: t('description'),
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

  return (
    <PageTransition>
      <div>
        <header className="mb-12">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-400">{t('description')}</p>
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
