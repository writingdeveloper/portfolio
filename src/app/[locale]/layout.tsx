import type { Metadata } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'
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
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: true,
})

// Korean web font — subset Korean glyphs so the ko locale doesn't fall back to
// system fonts and trigger CLS. FOLIO-22.
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-kr',
  display: 'swap',
  preload: true,
})

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
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${notoSansKR.variable} font-sans antialiased bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen transition-[background-color] duration-200`}>
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
                className="max-w-5xl mx-auto px-4 py-8"
              >
                {children}
              </main>
              <Footer />
            </>
          )}
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
