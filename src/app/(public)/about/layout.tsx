import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about Nova Mir — a solo web development studio building custom websites, lead systems, and operational tools for small businesses.',
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
