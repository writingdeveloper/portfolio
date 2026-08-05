import type { Metadata } from 'next'
import { Inter, Bricolage_Grotesque, Space_Mono } from 'next/font/google'
import { headers } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { isImmersiveRoute } from '@/components/layout/layout-chrome-rules'
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/constants'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAdSense } from '@/components/analytics/GoogleAdSense'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { OutboundTracker } from '@/components/analytics/OutboundTracker'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: true,
})

// Noto Sans KR is gone. It was added (FOLIO-22) as *the* Korean face, before
// the Builder's Ledger redesign put Pretendard ahead of it in the stack. Once
// Pretendard covers Korean, Noto is a second Korean webfont racing the first:
// it was pulling 236KB across six files, 76KB of it preloaded onto the
// critical path next to the LCP image. Korean now falls back to the system
// faces already named in --font-sans (Apple SD Gothic Neo, Malgun Gothic) for
// the moment before a Pretendard subset lands.

// Builder's Ledger redesign type system: Bricolage Grotesque (editorial
// display), Space Mono (ledger labels), Pretendard (Korean + body). Pretendard
// is self-hosted (public/fonts) so the strict nonce CSP never needs a font CDN.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

// Pretendard is no longer a next/font local face. The single 2.0MB variable
// file was preloaded on every route and was the site's LCP bottleneck, so it
// is now declared as ~90 unicode-range subsets in src/app/pretendard.css and
// the browser fetches only the ranges a page paints. --font-pretendard moved
// to :root in globals.css to replace the class next/font used to generate.

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const messages = await getMessages({ locale })
  const meta = (messages as Record<string, Record<string, string>>).metadata

  const localePath = locale === 'ko' ? '' : `/${locale}`

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: meta?.title || SITE_NAME,
      template: `%s | ${meta?.title || SITE_NAME}`,
    },
    description: meta?.description,
    openGraph: {
      siteName: SITE_NAME,
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      type: 'website',
      url: `${SITE_URL}${localePath}`,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [DEFAULT_OG_IMAGE],
    },
    alternates: {
      canonical: `${SITE_URL}${localePath}`,
      languages: {
        ko: SITE_URL,
        en: `${SITE_URL}/en`,
        'x-default': SITE_URL,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'ko' | 'en')) {
    notFound()
  }

  setRequestLocale(locale)
  const ta = await getTranslations({ locale, namespace: 'accessibility' })
  const messages = await getMessages()
  const headersList = await headers()
  const nonce = headersList.get('x-nonce') ?? undefined
  const pathname = headersList.get('x-pathname') ?? ''
  const immersive = isImmersiveRoute(pathname)

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        {/* Browsers hide the nonce content attribute after parsing, so React's
            hydration diff always mismatches on it — suppress that one warning. */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${bricolage.variable} ${spaceMono.variable} font-sans antialiased bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen transition-[background-color] duration-200`}>
        <NextIntlClientProvider messages={messages}>
          {immersive ? (
            children
          ) : (
            <>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--btn-primary-bg)] focus:text-[var(--btn-primary-text)] focus:rounded-lg"
              >
                {ta('skipToContent')}
              </a>
              <Header />
              <main
                id="main-content"
                className="max-w-[1400px] mx-auto px-6 sm:px-10 py-8"
              >
                {children}
              </main>
              <Footer />
            </>
          )}
        </NextIntlClientProvider>
        {/* Third-party analytics/ads load after hydration (next/script
            afterInteractive) so they stay off the critical render path. */}
        <GoogleAnalytics nonce={nonce} />
        {/* One delegated listener turns departures (demo, code, store, mail)
            into named GA4 events, without making any card a client component. */}
        <OutboundTracker />
        <GoogleAdSense nonce={nonce} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
