import Script from 'next/script'
import { GA_MEASUREMENT_ID } from '@/lib/constants'

/**
 * Google Analytics 4 (gtag.js).
 *
 * Perf: the heavy gtag.js loader is deferred with next/script `afterInteractive`
 * so it stays off the critical render path. The tiny inline bootstrap is kept as
 * a server-rendered, nonce'd <script> (NOT next/script) so it always executes
 * under the strict nonce-based CSP — it defines the gtag stub and queues js/
 * config into dataLayer, which the deferred loader processes once it arrives.
 * (Letting next/script inject the inline block client-side risked the nonce not
 * being applied, which CSP would then block.) The gtag loader host is
 * allowlisted in proxy.ts, so the external script loads with or without a nonce.
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
      {/* Browsers hide the nonce content attribute after parsing, so React's
          hydration diff always mismatches on it — suppress that one warning. */}
      <script
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`,
        }}
      />
    </>
  )
}
