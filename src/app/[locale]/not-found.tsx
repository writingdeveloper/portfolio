import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function NotFound() {
  const t = useTranslations('error')
  const tc = useTranslations('common')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-[var(--text-secondary)]">{t('notFoundDescription')}</p>
      <Link
        href="/"
        className="px-4 py-2 border border-[var(--border-hover)] rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
      >
        {tc('backToHome')}
      </Link>
    </div>
  )
}
