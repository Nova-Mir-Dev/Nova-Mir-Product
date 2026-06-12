import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Nova Mir process: Discovery, Design & Development, Launch & Grow. See how we build websites for small businesses.',
}

export default function ProcessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
