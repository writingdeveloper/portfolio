import { getTranslations } from 'next-intl/server'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Project, Skill, TimelineItem, PostSummary } from '@/types/content'

interface PlaySemanticFallbackProps {
  projects: Project[]
  skills: Skill[]
  timeline: TimelineItem[]
  posts: PostSummary[]
  locale: string
}

/**
 * Server-rendered, fully visible content view of the play page — the base
 * layer of a progressive-enhancement stack. It is always present in the
 * initial HTML (it lives outside the dynamic, ssr:false PlayClient), so it
 * serves three audiences at once:
 *
 *   1. Screen readers / keyboard users / crawlers — the 3D Canvas is decorative.
 *   2. Anyone whose WebGL/3D layer never appears — a failed or slow chunk load,
 *      a device without WebGL, or a content blocker that hides the full-screen
 *      Canvas overlay (a common cosmetic-filter false positive). The opaque
 *      PlayClient overlay sits ON TOP of this when it renders successfully; if
 *      it never does, this readable content is what remains — never a frozen
 *      black screen. FOLIO-19.
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
    <div className="relative h-screen w-full overflow-y-auto bg-[#06060f] text-[#e6e6f0]">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#a78bfa] hover:text-[#e8d5a3] transition-colors tracking-widest uppercase"
        >
          <ArrowLeft size={16} />
          {t('exit')}
        </Link>

        <header className="mt-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#f4f1ff]">{th('hero.name')}</h1>
          <p className="mt-2 text-lg text-[#a78bfa]">{th('hero.role')}</p>
        </header>

        <section aria-labelledby="sr-projects" className="mt-14">
          <h2
            id="sr-projects"
            className="text-xs font-semibold tracking-[0.3em] uppercase text-[#c4a35a]"
          >
            {sectionLabels.projects}
          </h2>
          <ul className="mt-5 space-y-5">
            {projects.map((p) => {
              const description = locale === 'ko' ? p.descriptionKo : p.descriptionEn
              return (
                <li
                  key={p.name}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
                >
                  <strong className="text-[#f4f1ff] font-semibold">{p.name}</strong>
                  {description ? (
                    <p className="mt-1.5 text-sm leading-relaxed text-[#b8b8cc]">{description}</p>
                  ) : null}
                  {p.website ? (
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#a78bfa] hover:text-[#e8d5a3] transition-colors"
                    >
                      {p.name}
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby="sr-skills" className="mt-14">
          <h2
            id="sr-skills"
            className="text-xs font-semibold tracking-[0.3em] uppercase text-[#c4a35a]"
          >
            {sectionLabels.skills}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {skills.map((s) => (
              <li
                key={s.name}
                className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-sm text-[#b8b8cc]"
              >
                <strong className="font-medium text-[#e6e6f0]">{s.name}</strong>{' '}
                <span className="text-[#7c6cf0]">({s.category})</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sr-timeline" className="mt-14">
          <h2
            id="sr-timeline"
            className="text-xs font-semibold tracking-[0.3em] uppercase text-[#c4a35a]"
          >
            {sectionLabels.timeline}
          </h2>
          <ul className="mt-5 space-y-5">
            {timeline.map((item, i) => (
              <li key={`${item.date}-${i}`} className="border-l border-white/10 pl-4">
                <time className="text-xs tracking-widest text-[#7c6cf0]">{item.date}</time>
                <strong className="mt-1 block text-[#f4f1ff] font-semibold">
                  {locale === 'ko' ? item.titleKo : item.titleEn}
                </strong>
                <p className="mt-1 text-sm leading-relaxed text-[#b8b8cc]">
                  {locale === 'ko' ? item.descriptionKo : item.descriptionEn}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sr-blog" className="mt-14">
          <h2
            id="sr-blog"
            className="text-xs font-semibold tracking-[0.3em] uppercase text-[#c4a35a]"
          >
            {sectionLabels.blog}
          </h2>
          <ul className="mt-5 space-y-4">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:border-[#a78bfa]/30"
                >
                  <strong className="text-[#f4f1ff] font-semibold group-hover:text-[#e8d5a3] transition-colors">
                    {post.title}
                  </strong>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#b8b8cc]">{post.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
