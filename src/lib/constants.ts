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

// Google Analytics 4 Measurement ID, e.g. "G-XXXXXXXXXX" (property account:
// sihyeongdev@gmail.com). Intentionally empty until the GA4 property exists —
// the analytics component renders nothing while this is blank. Set it via the
// NEXT_PUBLIC_GA_ID environment variable in the Vercel project settings.
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''
