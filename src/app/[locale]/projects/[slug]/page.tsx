import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, ExternalLink, Github, Lock } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import projectsData from '../../../../../content/projects.json'
import type { Project } from '@/types/content'
import { SITE_URL } from '@/lib/constants'
import { APP_CATEGORY } from '@/lib/projects'
import { predecessorOf } from '@/lib/lineage'
import { getAllPosts } from '@/lib/mdx'
import { buildProjectPostMap } from '@/lib/post-project-links'
import { PageTransition } from '@/components/ui/PageTransition'
import {
  generateBreadcrumbJsonLd,
  generateProjectJsonLd,
  safeJsonLd,
  toAbsoluteUrl,
} from '@/lib/seo'

const PROJECTS = projectsData.projects as Project[]

function findProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug)
}

/** Every project in every locale — the complete set of valid slugs. */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PROJECTS.map((project) => ({ locale, slug: project.slug })),
  )
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const project = findProject(slug)
  if (!project) return {}

  const description = locale === 'ko' ? project.descriptionKo : project.descriptionEn
  const localePath = locale === 'ko' ? '' : `/${locale}`
  const pageUrl = `${SITE_URL}${localePath}/projects/${slug}`

  // A real screenshot makes a far better card than the generated OG template,
  // so it wins when one exists. The template only fills in for the projects
  // that have no public UI to show.
  const ogImage = project.screenshot
    ? {
        url: toAbsoluteUrl(project.screenshot),
        width: 1440,
        height: 900,
        alt: (locale === 'ko' ? project.screenshotAltKo : project.screenshotAltEn) ?? project.name,
      }
    : {
        url: `${SITE_URL}/api/og?title=${encodeURIComponent(project.name)}&description=${encodeURIComponent(description.slice(0, 120))}`,
        width: 1200,
        height: 630,
        alt: project.name,
      }

  return {
    title: project.name,
    description,
    openGraph: {
      url: pageUrl,
      title: project.name,
      description,
      type: 'website',
      images: [ogImage],
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        ko: `${SITE_URL}/projects/${slug}`,
        en: `${SITE_URL}/en/projects/${slug}`,
        'x-default': `${SITE_URL}/projects/${slug}`,
      },
    },
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  // Renders the not-found screen for an unknown slug. The response still
  // carries HTTP 200 — a soft 404, site-wide (the blog post route behaves
  // identically). This is an ACCEPTED TRADE-OFF, not an unfixed bug; the
  // reasoning is worth keeping because the fix looks cheap and isn't:
  //
  // The [locale] layout reads headers() for the CSP nonce, which makes every
  // route render on demand. `notFound()` on a dynamically rendered route
  // cannot set the status line. Measured: `dynamicParams = false` alone is
  // inert while the route is dynamic, but drop the headers() call and the same
  // flag produces a real 404 — so the only fix is to prerender these routes.
  //
  // Prerendering is what we cannot have. Measured on a static build: Next
  // emits its inline bootstrap scripts — including the per-page __next_f RSC
  // payload — with NO nonce, because a build has no per-request value to put
  // there. script-src here has no 'unsafe-inline', so every one of them would
  // be blocked and hydration would die. The RSC payload differs per page and
  // per edit, so CSP hashes can't cover it either. Fixing the status code
  // means adding 'unsafe-inline' to script-src.
  //
  // That trade is not worth it: notFound() already injects `noindex`, so these
  // URLs stay out of the index regardless of the status code. We would be
  // giving up the site's main XSS defence to change a number on pages that do
  // not exist. Revisit only if the nonce CSP goes away for other reasons.
  const project = findProject(slug)
  if (!project) notFound()

  const t = await getTranslations({ locale, namespace: 'projects' })
  const isKo = locale === 'ko'
  const localePath = isKo ? '' : `/${locale}`
  const description = isKo ? project.descriptionKo : project.descriptionEn
  const screenshotAlt = (isKo ? project.screenshotAltKo : project.screenshotAltEn) ?? ''
  const predecessor = predecessorOf(project)
  const relatedPost = buildProjectPostMap(
    getAllPosts(locale),
    PROJECTS.map((p) => p.slug),
  ).get(project.slug)

  const pageUrl = `${SITE_URL}${localePath}/projects/${slug}`
  const projectJsonLd = generateProjectJsonLd(
    {
      name: project.name,
      description,
      url: pageUrl,
      techStack: project.techStack,
      website: project.website,
      // A private repo has no code link anywhere else on the site; asserting it
      // in structured data would leak what the Private badge deliberately hides.
      github: project.private ? undefined : project.github,
      playStore: project.playStore,
      appCategory: APP_CATEGORY[project.slug],
      ...(project.screenshot ? { image: toAbsoluteUrl(project.screenshot) } : {}),
    },
    locale,
  )
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: isKo ? '홈' : 'Home', url: `${SITE_URL}${localePath}` },
    { name: t('title'), url: `${SITE_URL}${localePath}/projects` },
    { name: project.name, url: pageUrl },
  ])

  const statusColors: Record<string, string> = {
    active: 'bg-[var(--status-active-bg)] text-[var(--status-active-text)]',
    building: 'bg-[var(--status-building-bg)] text-[var(--status-building-text)]',
    launched: 'bg-[var(--status-launched-bg)] text-[var(--status-launched-text)]',
    archived: 'bg-[var(--status-archived-bg)] text-[var(--status-archived-text)]',
  }

  return (
    <PageTransition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(projectJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />

      <div className="max-w-3xl mx-auto">
        <a
          href={`${localePath}/projects`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-emphasis)] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> {t('backToProjects')}
        </a>

        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h1 className="text-3xl font-bold ledger-display">{project.name}</h1>
            {project.status && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[project.status] ?? statusColors.archived}`}>
                {t(`status.${project.status}`)}
              </span>
            )}
            {project.private && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                <Lock size={11} /> {t('private')}
              </span>
            )}
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">{description}</p>
        </header>

        {project.screenshot && (
          <div className="relative aspect-[16/10] mb-8 rounded-xl overflow-hidden border border-[var(--border-default)] bg-[var(--bg-elevated)]">
            {/* This is the page's LCP element, so it loads eagerly. */}
            <Image
              src={project.screenshot}
              alt={screenshotAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover object-top"
            />
          </div>
        )}

        {project.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-8">
            {project.techStack.map((tech) => (
              <span key={tech} className="text-xs px-2 py-1 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 mb-8">
          {project.website && (
            <a href={project.website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] transition-colors">
              <ExternalLink size={15} /> {t('viewProject')}
            </a>
          )}
          {project.github && !project.private && (
            <a href={project.github} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] transition-colors">
              <Github size={15} /> {t('viewCode')}
            </a>
          )}
          {project.playStore && (
            <a href={project.playStore} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-emphasis)] transition-colors">
              <ExternalLink size={15} /> {t('viewOnPlayStore')}
            </a>
          )}
        </div>

        {(relatedPost || predecessor) && (
          <div className="flex flex-col gap-3 border-t border-[var(--border-default)] pt-6">
            {relatedPost && (
              <a href={`${localePath}/blog/${relatedPost.slug}`}
                className="flex items-start gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-emphasis)] transition-colors">
                <BookOpen size={14} className="mt-0.5 shrink-0" /> {t('readTheBuildLog', { title: relatedPost.title })}
              </a>
            )}
            {predecessor && (
              <a href={`${localePath}/graveyard`}
                className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-emphasis)] transition-colors">
                <ArrowLeft size={14} /> {t('continuedFrom', { name: predecessor.name })}
              </a>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
