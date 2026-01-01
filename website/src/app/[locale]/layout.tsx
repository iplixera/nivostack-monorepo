import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, defaultLocale } from '@/i18n'
import '../globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://nivostack.com'),
  title: {
    default: 'NivoStack - Mobile App Monitoring & Configuration Platform',
    template: '%s | NivoStack',
  },
  description: 'Complete mobile app monitoring and configuration platform. Track API calls, monitor logs, catch crashes, manage configurations, and mock APIs—all from one dashboard.',
  keywords: ['mobile app monitoring', 'API tracing', 'crash reporting', 'remote configuration', 'mobile SDK', 'app debugging'],
  authors: [{ name: 'NivoStack' }],
  creator: 'NivoStack',
  publisher: 'NivoStack',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nivostack.com',
    siteName: 'NivoStack',
    title: 'NivoStack - Mobile App Monitoring & Configuration Platform',
    description: 'Complete mobile app monitoring and configuration platform. Track API calls, monitor logs, catch crashes, manage configurations, and mock APIs—all from one dashboard.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NivoStack',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NivoStack - Mobile App Monitoring & Configuration Platform',
    description: 'Complete mobile app monitoring and configuration platform.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const locale = params.locale || defaultLocale
  
  if (!locales.includes(locale as typeof locales[number])) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="scroll-smooth">
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

