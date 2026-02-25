import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { getAllPosts } from '@/lib/mdx'
import type { PostMeta } from '@/lib/mdx'
import { projects } from '../../../content/projects'
import type { Project } from '../../../content/projects'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import { PostCard } from '@/components/blog/PostCard'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { PageTransition } from '@/components/ui/PageTransition'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const posts = getAllPosts(locale).slice(0, 3)
  const featuredProjects = projects.filter((p) => p.featured)

  return <HomeContent posts={posts} projects={featuredProjects} />
}

function HomeContent({ posts, projects: featuredProjects }: { posts: PostMeta[]; projects: Project[] }) {
  const t = useTranslations('home')

  return (
    <PageTransition>
      <div className="space-y-20">
        <section className="pt-12 pb-8">
          <p className="text-gray-400 text-lg mb-2">{t('hero.greeting')}</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('hero.name')}</h1>
          <p className="text-xl text-blue-400 mb-4">{t('hero.role')}</p>
          <p className="text-gray-400 max-w-xl text-lg">{t('hero.description')}</p>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t('latestPosts')}</h2>
            <Link href="/blog" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              {t('viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">{t('noPosts')}</p>
          )}
        </section>

        {featuredProjects.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-8">{t('featuredProjects')}</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageTransition>
  )
}
