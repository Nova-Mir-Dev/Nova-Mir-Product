import type { Metadata, Viewport } from 'next'
import { Sora, Onest } from 'next/font/google'
import { ThemeScript } from './(public)/_components/theme-script'
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
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' },
  ],
  openGraph: {
    title: 'Nova Mir — Web Development for Small Businesses',
    description:
      'Nova Mir builds websites and operational tools for small businesses. Custom web development, lead systems, and process automation.',
    siteName: 'Nova Mir',
    type: 'website',
    url: 'https://www.novamir.dev',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@novamir',
    title: 'Nova Mir — Web Development for Small Businesses',
    description:
      'Nova Mir builds websites and operational tools for small businesses. Custom web development, lead systems, and process automation.',
  },
  alternates: { canonical: 'https://www.novamir.dev' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <script
          defer
          data-domain="novamir.dev"
          src="https://plausible.io/js/script.js"
        />
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
        {children}
        <JsonLd />
      </body>
    </html>
  )
}
