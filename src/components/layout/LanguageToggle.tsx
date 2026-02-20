'use client'

import { useLocale } from 'next-intl'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { Globe } from 'lucide-react'

export function LanguageToggle() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const ta = useTranslations('accessibility')

  function toggle() {
    const next = locale === 'ko' ? 'en' : 'ko'
    router.replace(pathname, { locale: next })
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
      aria-label={ta('switchLanguage')}
    >
      <Globe size={16} aria-hidden="true" />
      <span className="uppercase font-medium">{locale}</span>
    </button>
  )
}
