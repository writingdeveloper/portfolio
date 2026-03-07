'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('error')
  const tc = useTranslations('common')

  useEffect(() => {
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-4xl font-bold">500</h1>
      <p className="text-[var(--text-secondary)]">{t('somethingWentWrong')}</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          type="button"
          className="px-4 py-2 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] rounded-lg hover:bg-[var(--btn-primary-bg-hover)] transition-colors"
        >
          {t('tryAgain')}
        </button>
        <Link
          href="/"
          className="px-4 py-2 border border-[var(--border-hover)] rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
        >
          {tc('backToHome')}
        </Link>
      </div>
    </div>
  )
}
