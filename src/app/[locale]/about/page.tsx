import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

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
    <div className="max-w-3xl mx-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-400">{t('description')}</p>
      </header>

      <div className="prose-content text-gray-300 space-y-6">
        <p>
          개발자이자 창업가로서 기술로 문제를 해결하고 있습니다.
          Soursea를 비롯한 프로젝트들을 만들고 운영하고 있으며,
          그 과정에서 배운 것들을 이 블로그를 통해 공유합니다.
        </p>
      </div>
    </div>
  )
}
