'use client'

import { useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'

const CONTAINER_ID = 'giscus-comments-root'

export function Comments() {
  const locale = useLocale()
  const t = useTranslations('blog')

  useEffect(() => {
    const container = document.getElementById(CONTAINER_ID)
    if (!container) return
    // Mark that the effect ran so we can verify in the DOM
    container.setAttribute('data-giscus-mount', 'ran')
    if (container.querySelector('script[src*="giscus.app/client.js"]')) return

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', 'writingdeveloper/portfolio')
    script.setAttribute('data-repo-id', 'R_kgDOQ77L_Q')
    script.setAttribute('data-category', 'Announcements')
    script.setAttribute('data-category-id', 'DIC_kwDOQ77L_c4C37DK')
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', 'preferred_color_scheme')
    script.setAttribute('data-lang', locale === 'ko' ? 'ko' : 'en')
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true
    container.appendChild(script)
  }, [locale])

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border-default)]">
      <h2 className="text-lg font-bold mb-4">{t('comments')}</h2>
      <div id={CONTAINER_ID} />
    </section>
  )
}
