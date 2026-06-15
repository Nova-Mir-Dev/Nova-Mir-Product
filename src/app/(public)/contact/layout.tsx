import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Ready to start your project? Get in touch with Nova Mir for a free consultation. We typically respond within 1-2 business days.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
