export interface PricingTier {
  name: string
  startingPrice: number
  description: string
  features: string[]
  href: string
}

export type PricingTierSlug = 'starter' | 'growth' | 'enterprise'

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Website',
    startingPrice: 2500,
    description:
      'Custom-designed, mobile-friendly website that captures leads.',
    features: [
      'Custom design & development',
      'Mobile responsive',
      'Contact forms & map integration',
      'Basic SEO & analytics',
      'Hosting & security included',
    ],
    href: '/services',
  },
  {
    name: 'Website + Operations',
    startingPrice: 5000,
    description:
      'Everything in Website plus booking, payments, and automations.',
    features: [
      'Booking / intake workflows',
      'Payment & deposit flow',
      'Customer dashboard',
      'Email follow-up sequences',
      'Monthly performance reports',
    ],
    href: '/services',
  },
  {
    name: 'Full Growth System',
    startingPrice: 8500,
    description:
      'Full-stack growth system with CRM, lead capture, and priority support.',
    features: [
      'Automated lead capture & CRM',
      'Email & SMS automations',
      'Priority support & maintenance',
      'Custom integrations',
      'Dedicated account manager',
    ],
    href: '/services',
  },
]
