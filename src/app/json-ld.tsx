export function JsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Nova Mir',
    url: 'https://novamir.dev',
    email: 'hello@novamir.dev',
    description:
      'Web development for small businesses. Custom websites, lead systems, and operational tools.',
    foundingDate: '2025',
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Nova Mir',
    url: 'https://novamir.dev',
    description: 'Web development for small businesses.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://novamir.dev/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
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
    areaServed: ['CA', 'US', 'UK', 'EU', 'AU', 'MX'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Web Development Packages',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'Managed Website' },
          price: '1500',
          priceCurrency: 'CAD',
        },
        {
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: 'Website + Lead System' },
          price: '3000',
          priceCurrency: 'CAD',
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Website + Operations System',
          },
          price: '5000',
          priceCurrency: 'CAD',
        },
      ],
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
