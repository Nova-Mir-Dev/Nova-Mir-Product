import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Nova Mir. Tell us about your project and we will follow up within 1-2 business days.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
