export interface PricingTier {
  name: string
  startingPrice: number
  description: string
  features: string[]
  href: string
  isFeatured: boolean
}

function envPrice(key: string, fallback: number): number {
  const raw = typeof process !== 'undefined' ? process.env[key] : undefined
  return raw ? parseInt(raw, 10) || fallback : fallback
}

function envStr(key: string, fallback: string): string {
  const raw = typeof process !== 'undefined' ? process.env[key] : undefined
  return raw || fallback
}

export function getFoundingOfferLabel(): string {
  const count = envStr('NEXT_PUBLIC_FOUNDING_OFFER_COUNT', '3')
  const price = envPrice('NEXT_PUBLIC_FOUNDING_OFFER_PRICE', 2000)
  return `First ${count} clients at a flat $${price.toLocaleString()} rate`
}

export function getMaintenanceRetainer(): string {
  const min = envPrice('NEXT_PUBLIC_MAINTENANCE_MIN', 300)
  const max = envPrice('NEXT_PUBLIC_MAINTENANCE_MAX', 500)
  return `$${min}–$${max}/month`
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: envStr('NEXT_PUBLIC_TIER1_NAME', 'Managed Website'),
    startingPrice: envPrice('NEXT_PUBLIC_TIER1_PRICE', 1800),
    description: 'Small businesses that need a credible online presence.',
    features: [
      'Custom-designed site',
      'Mobile responsive',
      'Contact form',
      'SEO basics',
      'Analytics',
      'Hosting setup',
    ],
    href: '/services',
    isFeatured: false,
  },
  {
    name: envStr('NEXT_PUBLIC_TIER2_NAME', 'Website + Lead System'),
    startingPrice: envPrice('NEXT_PUBLIC_TIER2_PRICE', 3000),
    description: 'Businesses ready to capture and track leads.',
    features: [
      'Everything in Managed Website',
      'Lead capture form',
      'Email notifications',
      'CRM / spreadsheet log',
      'Confirmation messages',
      'Simple reporting',
    ],
    href: '/services',
    isFeatured: true,
  },
  {
    name: envStr('NEXT_PUBLIC_TIER3_NAME', 'Website + Operations'),
    startingPrice: envPrice('NEXT_PUBLIC_TIER3_PRICE', 5000),
    description: 'Businesses needing booking, payments, and dashboards.',
    features: [
      'Everything in Website + Lead System',
      'Booking / intake workflows',
      'Payment & deposit flow',
      'Dashboard',
      'Automated follow-up',
      'System documentation',
    ],
    href: '/services',
    isFeatured: false,
  },
]
