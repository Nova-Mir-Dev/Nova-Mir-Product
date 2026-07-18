export interface PricingTier {
  name: string
  startingPrice: number
  description: string
  features: string[]
  href: string
  isFeatured: boolean
}

const divergenceWarned = new Set<string>()

/**
 * These NEXT_PUBLIC_* values are a crash-protection fallback for when the
 * pricing_tiers table is unreachable. An env override is meant only to keep
 * that fallback in sync with the DB — if it sets a *different* value, the
 * marketing copy can silently disagree with the source-of-truth table. Warn
 * (server-side, once per key) so the divergence is visible in logs without
 * ever crashing the page.
 */
function warnOverrideDivergence(
  key: string,
  override: string,
  canonical: string,
): void {
  if (override === canonical) return
  if (typeof window !== 'undefined') return
  if (divergenceWarned.has(key)) return
  divergenceWarned.add(key)
  console.warn(
    `[pricing] ${key}=${override} overrides the canonical value ${canonical}. ` +
      `The pricing_tiers table is the source of truth; keep this override in ` +
      `sync with it or unset it to avoid marketing/DB price drift.`,
  )
}

function envPrice(key: string, fallback: number): number {
  const raw = typeof process !== 'undefined' ? process.env[key] : undefined
  if (!raw) return fallback
  const parsed = parseInt(raw, 10)
  if (!parsed) return fallback
  warnOverrideDivergence(key, String(parsed), String(fallback))
  return parsed
}

function envStr(key: string, fallback: string): string {
  const raw = typeof process !== 'undefined' ? process.env[key] : undefined
  if (!raw) return fallback
  warnOverrideDivergence(key, raw, fallback)
  return raw
}

export function getFoundingOfferLabel(): string {
  const count = envStr('NEXT_PUBLIC_FOUNDING_OFFER_COUNT', '3')
  const price = envPrice('NEXT_PUBLIC_FOUNDING_OFFER_PRICE', 2000)
  return `First ${count} clients at a flat $${price.toLocaleString('en-US')} rate`
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
