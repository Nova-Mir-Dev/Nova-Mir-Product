import { getPublishedPricing } from '@/lib/content'
import { PRICING_TIERS } from '@/lib/pricing'
import type { PricingTierRow } from '@/types/content'
import type { PricingTier } from '@/lib/pricing'

function safeJson(obj: unknown): string {
  return JSON.stringify(obj).replace(/<\//g, '\\u003C/')
}

function getPrice(tier: PricingTierRow | PricingTier): number {
  return 'starting_price' in tier
    ? tier.starting_price
    : tier.startingPrice
}

export async function JsonLd() {
  const dbTiers = await getPublishedPricing()
  const tiers: (PricingTierRow | PricingTier)[] =
    dbTiers && dbTiers.length > 0 ? dbTiers : PRICING_TIERS

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Nova Mir',
    url: 'https://novamir.dev',
    email: 'hello@novamir.dev',
    description:
      'Web development for small businesses. Custom websites, lead systems, and operational tools.',
    foundingDate: '2026',
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Nova Mir',
    url: 'https://novamir.dev',
    description: 'Web development for small businesses.',
  }

  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Web Development Services',
    provider: {
      '@type': 'Organization',
      name: 'Nova Mir',
    },
    description:
      'Custom website design, lead systems, booking, payments, and operational tools for small businesses.',
    areaServed: ['US', 'MX'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Web Development Packages',
      itemListElement: tiers.map((tier) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: tier.name },
        price: String(getPrice(tier)).replace(/[$,]/g, ''),
        priceCurrency: 'USD',
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(service) }}
      />
    </>
  )
}
