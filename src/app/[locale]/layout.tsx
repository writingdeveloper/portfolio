import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
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
  const meta = (messages as any).metadata

  return {
    title: {
      default: meta?.title || 'WritingDeveloper',
      template: `%s | ${meta?.title || 'WritingDeveloper'}`,
    },
    description: meta?.description,
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

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-100 min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
