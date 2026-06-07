import { ADSENSE_CLIENT } from '@/lib/constants'

// Authorized Digital Sellers (ads.txt). Declares Google AdSense as an
// authorized seller of this site's inventory — recommended by AdSense and
// checked during/after site review. The publisher ID is derived from the
// AdSense client (ca-pub-XXXX → pub-XXXX); f08c47fec0942fa0 is Google's
// fixed certification-authority ID.
//
// Served at /ads.txt: the folder name contains a dot, so the next-intl proxy
// matcher (which excludes `.*\..*`) skips it and Next serves this handler
// directly — same pattern as feed.xml/route.ts.
export const dynamic = 'force-static'
export const revalidate = 86400

export function GET() {
  const publisherId = ADSENSE_CLIENT.replace(/^ca-/, '')
  const body = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
