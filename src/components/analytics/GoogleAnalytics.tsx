import Script from 'next/script'
import { GA_MEASUREMENT_ID } from '@/lib/constants'

/**
 * Google Analytics 4 (gtag.js).
 *
 * Loaded with next/script `afterInteractive` so gtag.js and its config run
 * after hydration rather than on the critical path (Google's recommended Next
 * strategy). The inline config carries the per-request CSP `nonce` (script-src
 * is nonce-based, not 'unsafe-inline'); the gtag loader host is allowlisted in
 * proxy.ts.
 *
 * Renders nothing until GA_MEASUREMENT_ID is set (NEXT_PUBLIC_GA_ID), so the
 * site ships safely before the GA4 property (sihyeongdev@gmail.com) exists.
 */
export function GoogleAnalytics({ nonce }: { nonce?: string }) {
  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      <Script
        id="ga-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        nonce={nonce}
      />
      <Script id="ga-config" strategy="afterInteractive" nonce={nonce}>
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  )
}
