import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { client } from '@/sanity/lib/client'
import { PROJECTS_QUERY } from '@/sanity/lib/queries'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { PageTransition } from '@/components/ui/PageTransition'

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const projects = await client.fetch(PROJECTS_QUERY)

  return <ProjectsContent projects={projects} />
}

function ProjectsContent({ projects }: { projects: any[] }) {
  const t = useTranslations('projects')

  return (
    <PageTransition>
      <div>
        <header className="mb-12">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-400">{t('description')}</p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project: any) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
