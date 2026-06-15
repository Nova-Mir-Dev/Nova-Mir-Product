import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'From discovery to launch: our three-step process for building custom websites and operational tools for small businesses.',
}

export default function ProcessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
