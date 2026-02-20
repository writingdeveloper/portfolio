import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { client } from '@/sanity/lib/client'
import { POSTS_QUERY, PROJECTS_QUERY } from '@/sanity/lib/queries'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import { PostCard } from '@/components/blog/PostCard'
import { ProjectCard } from '@/components/projects/ProjectCard'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [posts, projects] = await Promise.all([
    client.fetch(POSTS_QUERY, { limit: 3 }),
    client.fetch(PROJECTS_QUERY),
  ])

  return <HomeContent posts={posts} projects={projects} />
}

function HomeContent({ posts, projects }: { posts: any[]; projects: any[] }) {
  const t = useTranslations('home')

  return (
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
            {posts.map((post: any) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No posts yet.</p>
        )}
      </section>

      {projects.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-8">{t('featuredProjects')}</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.filter((p: any) => p.featured).map((project: any) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
