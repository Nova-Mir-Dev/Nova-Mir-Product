import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Nova Mir privacy policy — how we collect, use, store, and protect your personal information.',
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
