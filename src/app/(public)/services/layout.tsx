import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Managed websites, lead capture systems, and operations tools for small businesses. Custom web development from $1,800.',
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
