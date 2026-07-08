import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { useLocale } from 'next-intl'
import graveyardData from '../../../../content/graveyard.json'
import type { Tombstone as TombstoneData } from '@/types/content'
import { SITE_URL } from '@/lib/constants'
import { Tombstone } from '@/components/graveyard/Tombstone'
import { PageTransition } from '@/components/ui/PageTransition'
import { generateBreadcrumbJsonLd, safeJsonLd } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'graveyard' })
  const localePath = locale === 'ko' ? '' : `/${locale}`
  const pageUrl = `${SITE_URL}${localePath}/graveyard`
  return {
    title: t('title'),
    description: t('metaDescription'),
    openGraph: {
      url: pageUrl,
      title: t('title'),
      description: t('metaDescription'),
      images: [{ url: `${SITE_URL}/api/og?title=${encodeURIComponent(t('title'))}&description=${encodeURIComponent(t('description'))}`, width: 1200, height: 630, alt: t('title') }],
    },
    alternates: {
      canonical: pageUrl,
      languages: { ko: `${SITE_URL}/graveyard`, en: `${SITE_URL}/en/graveyard`, 'x-default': `${SITE_URL}/graveyard` },
    },
  }
}

export default async function GraveyardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <GraveyardContent />
}

function GraveyardContent() {
  const t = useTranslations('graveyard')
  const locale = useLocale()
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: locale === 'ko' ? '홈' : 'Home', url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}` },
    { name: t('title'), url: `${SITE_URL}${locale === 'ko' ? '' : '/en'}/graveyard` },
  ])
  const tombstones = graveyardData.tombstones as TombstoneData[]

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-6 h-40 bg-gradient-to-b from-[var(--bg-elevated)] to-transparent opacity-60"
        />
        <header className="relative mb-12">
          <h1 className="ledger-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">{t('title')}</h1>
          <p className="text-[var(--text-secondary)]">{t('description')}</p>
        </header>

        {tombstones.length > 0 ? (
          <div className="relative grid gap-6 sm:grid-cols-2">
            {tombstones.map((tomb) => (
              <Tombstone key={tomb.slug} tomb={tomb} />
            ))}
          </div>
        ) : (
          <p className="relative text-[var(--text-muted)]">{t('empty')}</p>
        )}
      </div>
    </PageTransition>
  )
}
