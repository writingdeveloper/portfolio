export const SITE_URL = 'https://writingdeveloper.blog'
export const SITE_NAME = 'WritingDeveloper'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/api/og`

// ── Third-party scripts ──────────────────────────────────────────────────────
// Google AdSense publisher client (account: super2451894@gmail.com). This value
// is public — it appears in the page source — so it defaults inline to keep
// AdSense site-review working without extra env config. Override per-env if ever
// needed via NEXT_PUBLIC_ADSENSE_CLIENT.
export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? 'ca-pub-3427879236190872'

// Google Analytics 4 Measurement ID — property "글쓰는 개발자 - GA4", web stream
// "writingdeveloper.blog" (stream 15021980866), account sihyeongdev@gmail.com.
// Public value (it appears in the page source), so it defaults inline; override
// per-env via NEXT_PUBLIC_GA_ID if ever needed.
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? 'G-77H1KB1H05'
