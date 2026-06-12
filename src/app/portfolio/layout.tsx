import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'View Nova Mir portfolio of custom websites and web applications built for small businesses.',
}

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
