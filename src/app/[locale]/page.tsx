import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllPosts, getCategories } from '@/lib/mdx'
import type { PostMeta } from '@/lib/mdx'
import { projects } from '../../../content/projects'
import type { Project } from '../../../content/projects'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import { PostCard } from '@/components/blog/PostCard'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { PageTransition } from '@/components/ui/PageTransition'
import { generateWebsiteJsonLd } from '@/lib/seo'
import { SITE_URL, SITE_NAME } from '@/lib/constants'
import type { Metadata } from 'next'

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
    description: t('hero.description'),
    openGraph: {
      url: pageUrl,
      title: `${t('hero.name')} - ${t('hero.role')}`,
      description: t('hero.description'),
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
  const categories = getCategories(locale)
  const categoryMap = Object.fromEntries(categories.map((c) => [c.value, c.label]))
  const featuredProjects = projects.filter((p) => p.featured)

  return <HomeContent posts={posts} projects={featuredProjects} locale={locale} categoryMap={categoryMap} />
}

function HomeContent({ posts, projects: featuredProjects, locale, categoryMap }: { posts: PostMeta[]; projects: Project[]; locale: string; categoryMap: Record<string, string> }) {
  const t = useTranslations('home')
  const webSiteJsonLd = generateWebsiteJsonLd(locale)

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <div className="space-y-20">
        <section className="pt-12 pb-8">
          <p className="text-[var(--text-secondary)] text-lg mb-2">{t('hero.greeting')}</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('hero.name')}</h1>
          <p className="text-xl text-[var(--accent-text)] mb-4">{t('hero.role')}</p>
          <p className="text-[var(--text-secondary)] max-w-xl text-lg">{t('hero.description')}</p>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t('latestPosts')}</h2>
            <Link href="/blog" className="flex items-center gap-1 text-sm text-[var(--accent-text)] hover:text-[var(--accent-text-hover)] transition-colors">
              {t('viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} categoryLabel={categoryMap[post.category]} />
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-center py-12">{t('noPosts')}</p>
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
