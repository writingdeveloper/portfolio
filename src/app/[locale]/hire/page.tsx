import type { ReactNode } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { PageTransition } from '@/components/ui/PageTransition'
import { SkillGrid } from '@/components/ui/SkillGrid'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { SITE_URL, CONTACT_EMAIL, LINKEDIN_URL } from '@/lib/constants'
import { getHireStats, HIRE_CASE_STUDIES } from '@/lib/projects'
import { generatePersonJsonLd, generateBreadcrumbJsonLd, safeJsonLd } from '@/lib/seo'
import aboutData from '../../../../content/about.json'
import projectsData from '../../../../content/projects.json'
import type { Project, Skill } from '@/types/content'

// Same cadence as /about: the copy is static and the counts only move when
// projects.json does.
export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'hire' })
  const localePath = locale === 'ko' ? '' : `/${locale}`
  const pageUrl = `${SITE_URL}${localePath}/hire`
  const stats = getHireStats(projectsData.projects as Project[])
  const description = t('metaDescription', { ...stats })

  return {
    title: t('metaTitle'),
    description,
    openGraph: {
      url: pageUrl,
      title: t('metaTitle'),
      description,
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      alternateLocale: locale === 'ko' ? ['en_US'] : ['ko_KR'],
      type: 'profile',
      images: [
        {
          url: `${SITE_URL}/api/og?title=${encodeURIComponent(t('title'))}&description=${encodeURIComponent(t('description'))}`,
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        ko: `${SITE_URL}/hire`,
        en: `${SITE_URL}/en/hire`,
        'x-default': `${SITE_URL}/hire`,
      },
    },
  }
}

export default async function HirePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <HireContent />
}

/** One labelled line inside an offer column. */
function OfferRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="ledger-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm text-[var(--text-secondary)]">{children}</dd>
    </div>
  )
}

function HireContent() {
  const t = useTranslations('hire')
  const locale = useLocale()
  const projects = projectsData.projects as Project[]
  const stats = getHireStats(projects)
  const skills = aboutData.skills as Skill[]

  const caseStudies = HIRE_CASE_STUDIES.map((slug) =>
    projects.find((p) => p.slug === slug),
  ).filter((p): p is Project => Boolean(p))

  const personJsonLd = generatePersonJsonLd(locale)
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: locale === 'ko' ? '홈' : 'Home', url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}` },
    { name: t('title'), url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}/hire` },
  ])

  const figures = [
    { value: stats.shipped, label: t('evidence.shipped') },
    { value: stats.playStore, label: t('evidence.playStore') },
    { value: stats.total, label: t('evidence.total') },
  ]

  return (
    <PageTransition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />

      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="ledger-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {t('title')}
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">{t('description')}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[t('badgeRemote'), t('badgeNow')].map((badge) => (
              <span
                key={badge}
                className="ledger-mono text-[11px] tracking-[0.15em] px-3 py-1.5 rounded-full bg-[var(--bg-elevated)] text-[var(--accent-text)] border border-[var(--border-hover)]"
              >
                {badge}
              </span>
            ))}
          </div>
        </header>

        {/* Two offers, stated separately. A merged "open to opportunities"
            weakens both — a hiring manager and a client are looking for
            different sentences, so each gets their own column. */}
        <section className="mb-16 grid gap-px overflow-hidden rounded-lg bg-[var(--border-default)] sm:grid-cols-2">
          <div className="bg-[var(--bg-elevated)] p-6">
            <h2 className="ledger-display text-xl font-bold mb-5">{t('fulltime.heading')}</h2>
            <dl className="space-y-4">
              <OfferRow label={t('fulltime.rolesLabel')}>{t('fulltime.roles')}</OfferRow>
              <OfferRow label={t('fulltime.modeLabel')}>{t('fulltime.mode')}</OfferRow>
              <OfferRow label={t('fulltime.bringLabel')}>{t('fulltime.bring')}</OfferRow>
            </dl>
          </div>
          <div className="bg-[var(--bg-elevated)] p-6">
            <h2 className="ledger-display text-xl font-bold mb-5">{t('contract.heading')}</h2>
            <dl className="space-y-4">
              <OfferRow label={t('contract.workLabel')}>{t('contract.work')}</OfferRow>
              <OfferRow label={t('contract.modeLabel')}>{t('contract.mode')}</OfferRow>
              <OfferRow label={t('contract.startLabel')}>{t('contract.start')}</OfferRow>
            </dl>
          </div>
        </section>

        {/* Counts come from the ledger, never from prose. */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">{t('evidence.heading')}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {figures.map((f) => (
              <div
                key={f.label}
                className="rounded-lg border border-[var(--border-default)] p-5"
              >
                <span className="ledger-display block text-3xl font-extrabold text-[var(--accent-text)]">
                  {f.value}
                </span>
                <span className="mt-1 block text-sm text-[var(--text-secondary)]">{f.label}</span>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-medium text-[var(--text-secondary)] mt-10 mb-4">
            {t('evidence.caseHeading')}
          </h3>
          <div className="grid gap-6 sm:grid-cols-2">
            {caseStudies.map((project, i) => (
              <ProjectCard key={project.slug} project={project} priority={i < 2} />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">{t('stack')}</h2>
          <SkillGrid skills={skills} />
        </section>

        {/* Both links are already instrumented: mailto and linkedin.com both
            classify as contact_click (see Task 1), so this section's
            effectiveness is measurable without adding tracking code. */}
        <section>
          <h2 className="text-xl font-bold mb-6">{t('contactHeading')}</h2>
          <div className="grid gap-px overflow-hidden rounded-lg bg-[var(--border-default)] sm:grid-cols-2">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex flex-col gap-1 bg-[var(--bg-elevated)] p-5 transition-opacity hover:opacity-90"
            >
              <span className="ledger-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-muted)]">
                EMAIL
              </span>
              <span className="ledger-mono text-sm text-[var(--text-primary)]">{CONTACT_EMAIL}</span>
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1 bg-[var(--bg-elevated)] p-5 transition-opacity hover:opacity-90"
            >
              <span className="ledger-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-muted)]">
                LINKEDIN
              </span>
              <span className="ledger-mono text-sm text-[var(--text-primary)]">in/sihyeonglee</span>
            </a>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
