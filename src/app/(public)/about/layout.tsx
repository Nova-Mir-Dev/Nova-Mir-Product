import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Nova Mir is a solo web development studio building custom websites, lead systems, and operational tools for small businesses. No templates, no upsells.',
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
