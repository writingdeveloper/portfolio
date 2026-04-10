'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'
import { isImmersiveRoute } from './layout-chrome-rules'

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
  const pathname = usePathname()

  if (isImmersiveRoute(pathname)) {
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
