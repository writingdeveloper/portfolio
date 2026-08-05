'use client'

import { useEffect } from 'react'
import { GA_MEASUREMENT_ID } from '@/lib/constants'
import { classifyOutboundLink } from '@/lib/analytics'

declare global {
  interface Window {
    gtag?: (command: 'event', name: string, params?: Record<string, unknown>) => void
  }
}

/**
 * Reports outbound clicks to GA4 from a single delegated listener.
 *
 * Every link worth counting already exists in server components (project
 * cards, the ledger home, tombstones, the footer, MDX bodies). Adding an
 * onClick to each would turn all of them into client components and ship far
 * more JS than the measurement is worth, so one capture-phase listener on the
 * document covers the whole site instead — including links inside posts, which
 * no per-component approach would have reached.
 *
 * Capture phase matters: the anchor navigates away, and a bubble-phase listener
 * can lose the race on a same-tab departure.
 *
 * gtag is defined by the inline bootstrap that GoogleAnalytics server-renders,
 * so it exists from parse time and queues into dataLayer until the deferred
 * loader arrives — a click during that window is still recorded.
 */
export function OutboundTracker() {
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return

    function onClick(event: MouseEvent) {
      // Modified clicks still navigate somewhere, and they still mean the same
      // intent, so they are counted the same way.
      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest('a')
      const href = anchor?.getAttribute('href')
      if (!href) return

      const hit = classifyOutboundLink(href, window.location.host)
      if (!hit) return

      window.gtag?.('event', hit.name, hit.params)
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
