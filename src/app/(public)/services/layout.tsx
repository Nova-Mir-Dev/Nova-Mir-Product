import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Nova Mir offers managed websites, lead systems, and operations tools for small businesses. Custom web development starting at $1,500.',
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
