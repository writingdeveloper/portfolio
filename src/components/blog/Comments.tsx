'use client'

import { useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'

export function Comments() {
  const locale = useLocale()
  const t = useTranslations('blog')

  // Use a callback ref rather than useRef + useEffect. Callback refs fire
  // synchronously when the element is mounted, which is more reliable
  // across React 19 strict-mode double-renders and any Suspense boundaries.
  // (The previous useEffect version silently did nothing in production.)
  const mountGiscus = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return
      if (
        node.querySelector('.giscus') ||
        node.querySelector('script[src*="giscus"]')
      ) {
        return
      }

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

      node.appendChild(script)
    },
    [locale]
  )

  return (
    <section className="mt-12 pt-8 border-t border-[var(--border-default)]">
      <h2 className="text-lg font-bold mb-4">{t('comments')}</h2>
      <div ref={mountGiscus} />
    </section>
  )
}
