import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Nova Mir terms of service — governing use of our website and web development services.',
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
