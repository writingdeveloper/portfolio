'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { Globe } from 'lucide-react'

export function LanguageToggle() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  function toggle() {
    const next = locale === 'ko' ? 'en' : 'ko'
    router.replace(pathname, { locale: next })
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors text-sm"
      aria-label="Switch language"
    >
      <Globe size={16} />
      <span className="uppercase font-medium">{locale}</span>
    </button>
  )
}
