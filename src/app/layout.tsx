import type { Metadata } from 'next'
import { Sora, Onest } from 'next/font/google'
import { ClientShell } from './_components/client-shell'
import { ThemeScript } from './_components/theme-script'
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

export const metadata: Metadata = {
  title: 'nova-mir-product',
  description: 'Bootstrapped with project-bootstrapper',
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
      </head>
      <body className={`${sora.variable} ${onest.variable}`}>
        <a href="#main-content" className="sr-only">
          Skip to content
        </a>
        <ThemeScript />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}