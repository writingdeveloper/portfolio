'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

interface LayoutChromeProps {
  children: React.ReactNode
}

/**
 * Wraps the page content and decides whether to render the app shell
 * (Header, main wrapper, Footer) or let the page take the full viewport.
 *
 * Immersive routes like /play render full-bleed — this replaces the
 * previous DOM manipulation in PlayClient.tsx that queried and hid the
 * header/footer imperatively.
 */
export function LayoutChrome({ children }: LayoutChromeProps) {
  const pathname = usePathname() ?? ''

  // /play and /en/play
  const isImmersive = /(^|\/)(play)(\/|$)/.test(pathname)

  if (isImmersive) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main
        id="main-content"
        className="max-w-5xl mx-auto px-4 py-8"
      >
        {children}
      </main>
      <Footer />
    </>
  )
}
