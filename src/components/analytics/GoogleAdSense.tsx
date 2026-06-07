import { ADSENSE_CLIENT } from '@/lib/constants'

/**
 * Google AdSense loader (account: super2451894@gmail.com).
 *
 * The async adsbygoogle.js tag is what AdSense scans for during site review,
 * so it ships site-wide from the document <head>. The host is allowlisted in
 * proxy.ts (script-src), and AdSense injects its further ad scripts/iframes
 * from the *.googlesyndication.com / *.doubleclick.net origins also allowlisted
 * there (we don't use 'strict-dynamic', so each origin must be explicit).
 */
export function GoogleAdSense({ nonce }: { nonce?: string }) {
  if (!ADSENSE_CLIENT) return null

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      nonce={nonce}
    />
  )
}
