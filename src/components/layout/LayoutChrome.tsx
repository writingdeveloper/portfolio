'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { isImmersiveRoute } from './layout-chrome-rules'

export function LayoutChrome({
  children,
  header,
  footer,
  skipToContentLabel,
}: {
  children: ReactNode
  header: ReactNode
  footer: ReactNode
  skipToContentLabel: string
}) {
  const pathname = usePathname()
  const immersive = isImmersiveRoute(pathname)

  if (immersive) return children

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--btn-primary-bg)] focus:text-[var(--btn-primary-text)] focus:rounded-lg"
      >
        {skipToContentLabel}
      </a>
      {header}
      <main id="main-content" className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8">
        {children}
      </main>
      {footer}
    </>
  )
}
