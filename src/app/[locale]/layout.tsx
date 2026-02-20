import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/constants'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
  const messages = await getMessages()

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-100 min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:rounded-lg">
            Skip to content
          </a>
          <Header />
          <main id="main-content" className="max-w-5xl mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
