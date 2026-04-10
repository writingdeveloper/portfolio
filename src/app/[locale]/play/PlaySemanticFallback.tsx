import { getTranslations } from 'next-intl/server'
import type { Project, Skill, TimelineItem, PostSummary } from '@/types/content'

interface PlaySemanticFallbackProps {
  projects: Project[]
  skills: Skill[]
  timeline: TimelineItem[]
  posts: PostSummary[]
  locale: string
}

/**
 * Server-rendered semantic HTML snapshot of the play page content.
 * This is the source of truth for screen readers, keyboard navigation,
 * and search crawlers — the 3D Canvas is purely decorative.
 *
 * Lives outside the dynamic (ssr:false) PlayClient so it appears in the
 * initial HTML response. FOLIO-19.
 */
export async function PlaySemanticFallback({
  projects,
  skills,
  timeline,
  posts,
  locale,
}: PlaySemanticFallbackProps) {
  const t = await getTranslations({ locale, namespace: 'play' })
  const th = await getTranslations({ locale, namespace: 'home' })

  const sectionLabels = {
    projects: t('sections.projects'),
    skills: t('sections.skills'),
    timeline: t('sections.timeline'),
    blog: t('sections.blog'),
  }

  return (
    <div className="sr-only">
      <h1>{th('hero.name')}</h1>
      <p>{th('hero.role')}</p>

      <section aria-labelledby="sr-projects">
        <h2 id="sr-projects">{sectionLabels.projects}</h2>
        <ul>
          {projects.map((p) => (
            <li key={p.name}>
              <strong>{p.name}</strong>
              {p.descriptionKo || p.descriptionEn ? (
                <p>{locale === 'ko' ? p.descriptionKo : p.descriptionEn}</p>
              ) : null}
              {p.website ? (
                <a href={p.website} target="_blank" rel="noopener noreferrer">
                  Visit {p.name}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sr-skills">
        <h2 id="sr-skills">{sectionLabels.skills}</h2>
        <ul>
          {skills.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong> ({s.category})
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sr-timeline">
        <h2 id="sr-timeline">{sectionLabels.timeline}</h2>
        <ul>
          {timeline.map((item, i) => (
            <li key={`${item.date}-${i}`}>
              <time>{item.date}</time>
              <strong>{locale === 'ko' ? item.titleKo : item.titleEn}</strong>
              <p>{locale === 'ko' ? item.descriptionKo : item.descriptionEn}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sr-blog">
        <h2 id="sr-blog">{sectionLabels.blog}</h2>
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <a href={`/${locale}/blog/${post.slug}`}>
                <strong>{post.title}</strong>
              </a>
              <p>{post.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
