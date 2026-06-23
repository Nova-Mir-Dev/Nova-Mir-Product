import { PRICING_TIERS } from '@/lib/pricing'

export function JsonLd() {
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
      itemListElement: PRICING_TIERS.map((tier) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: tier.name },
        price: String(tier.startingPrice).replace(/[$,]/g, ''),
        priceCurrency: 'USD',
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
      />
    </>
  )
}
