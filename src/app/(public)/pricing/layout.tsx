import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Transparent pricing for small business web development. Managed websites from $1,500, lead systems from $3,000, operations from $5,000.',
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
