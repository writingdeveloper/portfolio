import { useTranslations, useLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { PageTransition } from '@/components/ui/PageTransition'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SITE_URL } from '@/lib/constants'
import { skills, timeline, skillCategories } from '../../../../content/about'
import type { Skill, TimelineItem } from '../../../../content/about'
import { generatePersonJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  const localePath = locale === 'ko' ? '' : `/${locale}`
  const pageUrl = `${SITE_URL}${localePath}/about`
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      url: pageUrl,
      title: t('title'),
      description: t('description'),
      images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(t('title'))}&description=${encodeURIComponent(t('description'))}`, width: 1200, height: 630, alt: t('title') }],
    },
    alternates: {
      canonical: pageUrl,
      languages: { ko: `${SITE_URL}/about`, en: `${SITE_URL}/en/about`, 'x-default': `${SITE_URL}/about` },
    },
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <AboutContent />
}

function AboutContent() {
  const t = useTranslations('about')
  const locale = useLocale()
  const personJsonLd = generatePersonJsonLd(locale)
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: locale === 'ko' ? '홈' : 'Home', url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}` },
    { name: locale === 'ko' ? '소개' : 'About', url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}/about` },
  ])

  const groupedSkills = {
    frontend: skills.filter((s) => s.category === 'frontend'),
    backend: skills.filter((s) => s.category === 'backend'),
    tools: skills.filter((s) => s.category === 'tools'),
  }

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-[var(--text-secondary)]">{t('description')}</p>
        </header>

        <div className="prose-content text-[var(--text-secondary)] space-y-6 mb-16">
          <p>{t('body')}</p>
        </div>

        {/* Skills */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">{t('skills')}</h2>
          <div className="space-y-6">
            {(Object.keys(groupedSkills) as Array<keyof typeof groupedSkills>).map((category) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                  {skillCategories[category][locale as 'ko' | 'en']}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {groupedSkills[category].map((skill: Skill) => (
                    <span
                      key={skill.name}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-sm text-[var(--text-primary)] border border-[var(--border-hover)]"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-xl font-bold mb-6">{t('timeline')}</h2>
          <div className="relative pl-6 border-l border-[var(--border-default)] space-y-8">
            {timeline.map((item: TimelineItem, i: number) => (
              <div key={i} className="relative">
                <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-[var(--timeline-dot)] border-2 border-[var(--bg-primary)]" />
                <span className="text-xs text-[var(--text-muted)] block mb-1">{item.date}</span>
                <h3 className="font-semibold text-[var(--text-primary)]">
                  {item.title[locale] || item.title['ko']}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {item.description[locale] || item.description['ko']}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
