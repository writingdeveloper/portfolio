import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { PageTransition } from '@/components/ui/PageTransition'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return {
    title: t('title'),
    description: t('description'),
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

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-400">{t('description')}</p>
        </header>

        <div className="prose-content text-gray-300 space-y-6">
          <p>{t('body')}</p>
        </div>
      </div>
    </PageTransition>
  )
}
