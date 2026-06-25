import type { Metadata, Viewport } from 'next'
import { Sora, Onest } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { ThemeRoot } from '@/components/theme-root'
import { ThemeScript } from './(public)/_components/theme-script'
import { CookieConsentBanner } from '@/components/cookie-consent-banner'
import { JsonLd } from './(public)/json-ld'
import './globals.css'
import 'azimuth-ui/styles.css'

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const onest = Onest({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.novamir.dev'),
  title: {
    template: '%s | Nova Mir',
    default: 'Nova Mir — Web Development for Small Businesses',
  },
  description:
    'Nova Mir builds websites and operational tools for small businesses. Custom web development, lead systems, and process automation.',
  icons: [
    { rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' },
  ],
  openGraph: {
    title: 'Nova Mir — Web Development for Small Businesses',
    description:
      'Nova Mir builds websites and operational tools for small businesses. Custom web development, lead systems, and process automation.',
    siteName: 'Nova Mir',
    type: 'website',
    url: 'https://www.novamir.dev',
    images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@novamir',
    title: 'Nova Mir — Web Development for Small Businesses',
    description:
      'Nova Mir builds websites and operational tools for small businesses. Custom web development, lead systems, and process automation.',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="apple-touch-icon" href="/logo-icon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              'navigator.serviceWorker.getRegistrations().then(r=>r.forEach(r=>r.unregister()))',
          }}
        />
      </head>
      <body className={`${sora.variable} ${onest.variable}`}>
        <a href="#main-content" className="sr-only">
          Skip to content
        </a>
        <ThemeScript />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeRoot>
            {children}
            <CookieConsentBanner />
          </ThemeRoot>
        </NextIntlClientProvider>
        <JsonLd />
      </body>
    </html>
  )
}
