import type { ReactNode } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { PageTransition } from '@/components/ui/PageTransition'
import {
  SITE_URL,
  CONTACT_EMAIL,
  ADSENSE_CLIENT,
  GA_MEASUREMENT_ID,
} from '@/lib/constants'
import { generateBreadcrumbJsonLd, safeJsonLd } from '@/lib/seo'

// The copy is static: it only moves when the set of third-party scripts moves,
// and that is a code change anyway. Same cadence as /hire and /about.
export const revalidate = 3600

/**
 * Opt-out and policy destinations named in the disclosure.
 *
 * AdSense requires the policy to *link* the opt-out, not merely mention it, so
 * these are part of the compliance surface rather than decoration — if one dies
 * the page stops satisfying the requirement it exists for.
 */
const ADS_SETTINGS_URL = 'https://myadcenter.google.com/'
const ABOUT_ADS_URL = 'https://www.aboutads.info/choices/'
const GISCUS_URL = 'https://giscus.app'
const GITHUB_PRIVACY_URL =
  'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy' })
  const localePath = locale === 'ko' ? '' : `/${locale}`
  const pageUrl = `${SITE_URL}${localePath}/privacy`

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      url: pageUrl,
      title: t('metaTitle'),
      description: t('metaDescription'),
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      alternateLocale: locale === 'ko' ? ['en_US'] : ['ko_KR'],
      type: 'article',
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
        ko: `${SITE_URL}/privacy`,
        en: `${SITE_URL}/en/privacy`,
        'x-default': `${SITE_URL}/privacy`,
      },
    },
  }
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <PrivacyContent />
}

/** An outbound link inside body copy. */
function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--accent-text)] underline underline-offset-2 transition-opacity hover:opacity-80"
    >
      {children}
    </a>
  )
}

/** One disclosure block: a heading, the prose, and any identifier it names. */
function Section({
  heading,
  children,
  idLabel,
  idValue,
}: {
  heading: string
  children: ReactNode
  idLabel?: string
  idValue?: string
}) {
  return (
    <section className="border-t border-[var(--border-default)] pt-6">
      <h2 className="ledger-display text-lg font-bold mb-3">{heading}</h2>
      <p className="text-[var(--text-secondary)] leading-relaxed">{children}</p>
      {idLabel && idValue && (
        <p className="mt-3">
          <span className="ledger-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-muted)]">
            {idLabel}
          </span>{' '}
          <span className="ledger-mono text-sm text-[var(--text-primary)]">{idValue}</span>
        </p>
      )}
    </section>
  )
}

function PrivacyContent() {
  const t = useTranslations('privacy')
  const locale = useLocale()
  const localePath = locale === 'ko' ? '' : '/en'

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: locale === 'ko' ? '홈' : 'Home', url: `${SITE_URL}${localePath}` },
    { name: t('title'), url: `${SITE_URL}${localePath}/privacy` },
  ])

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />

      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="ledger-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {t('title')}
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">{t('description')}</p>
          <p className="mt-4 ledger-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-muted)]">
            {t('updatedLabel')} · {t('updated')}
          </p>
        </header>

        <p className="mb-10 text-[var(--text-secondary)] leading-relaxed">{t('intro')}</p>

        <div className="space-y-8">
          <Section heading={t('direct.heading')}>{t('direct.body')}</Section>

          <Section
            heading={t('analytics.heading')}
            idLabel={t('analytics.idLabel')}
            idValue={GA_MEASUREMENT_ID}
          >
            {t('analytics.body')}
          </Section>

          {/* The two opt-out links are what AdSense actually requires here. */}
          <Section
            heading={t('ads.heading')}
            idLabel={t('ads.idLabel')}
            idValue={ADSENSE_CLIENT}
          >
            {t.rich('ads.body', {
              ads: (chunks) => <Ext href={ADS_SETTINGS_URL}>{chunks}</Ext>,
              aboutads: (chunks) => <Ext href={ABOUT_ADS_URL}>{chunks}</Ext>,
            })}
          </Section>

          <Section heading={t('comments.heading')}>
            {t.rich('comments.body', {
              giscus: (chunks) => <Ext href={GISCUS_URL}>{chunks}</Ext>,
              policy: (chunks) => <Ext href={GITHUB_PRIVACY_URL}>{chunks}</Ext>,
            })}
          </Section>

          <Section heading={t('hosting.heading')}>{t('hosting.body')}</Section>

          <Section heading={t('choices.heading')}>{t('choices.body')}</Section>

          <Section heading={t('contact.heading')}>
            {t('contact.body')}{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="ledger-mono text-[var(--accent-text)] underline underline-offset-2 transition-opacity hover:opacity-80"
            >
              {CONTACT_EMAIL}
            </a>
          </Section>
        </div>
      </div>
    </PageTransition>
  )
}
