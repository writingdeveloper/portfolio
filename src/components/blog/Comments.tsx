'use client'

import { useEffect, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'

export function Comments() {
  const locale = useLocale()
  const t = useTranslations('blog')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || ref.current.querySelector('.giscus')) return

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', 'writingdeveloper/portfolio')
    script.setAttribute('data-repo-id', '')
    script.setAttribute('data-category', 'Comments')
    script.setAttribute('data-category-id', '')
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', 'dark_dimmed')
    script.setAttribute('data-lang', locale === 'ko' ? 'ko' : 'en')
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true

    ref.current.appendChild(script)
  }, [locale])

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border-default)]">
      <h2 className="text-lg font-bold mb-4">{t('comments')}</h2>
      <div ref={ref} />
    </section>
  )
}
