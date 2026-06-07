import { GA_MEASUREMENT_ID } from '@/lib/constants'

/**
 * Google Analytics 4 (gtag.js).
 *
 * Server component so it can stamp the per-request CSP `nonce` onto the inline
 * config script (the gtag loader is allowlisted by host in proxy.ts, but the
 * inline `gtag('config', …)` block is executable and needs the nonce).
 *
 * Renders nothing until GA_MEASUREMENT_ID is set (NEXT_PUBLIC_GA_ID), so the
 * site ships safely before the GA4 property (sihyeongdev@gmail.com) exists.
 */
export function GoogleAnalytics({ nonce }: { nonce?: string }) {
  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        nonce={nonce}
      />
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`,
        }}
      />
    </>
  )
}
