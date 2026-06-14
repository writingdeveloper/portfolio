import Script from 'next/script'
import { ADSENSE_CLIENT } from '@/lib/constants'

/**
 * Google AdSense loader (account: super2451894@gmail.com).
 *
 * Loaded with next/script `afterInteractive` so the heavy adsbygoogle.js tag
 * is fetched/executed AFTER hydration instead of competing for the main thread
 * during the critical load window (better TBT/INP/LCP). AdSense's review
 * crawler executes JS, so the tag is still discovered. The host is allowlisted
 * in proxy.ts (script-src); AdSense injects its further ad scripts/iframes from
 * the *.googlesyndication.com / *.doubleclick.net origins also allowlisted
 * there (we don't use 'strict-dynamic', so each origin must be explicit).
 */
export function GoogleAdSense({ nonce }: { nonce?: string }) {
  if (!ADSENSE_CLIENT) return null

  return (
    <Script
      id="adsbygoogle-loader"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      nonce={nonce}
    />
  )
}
