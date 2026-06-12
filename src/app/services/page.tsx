'use client'
import { Container, Text, Button, Card, Stack } from 'azimuth-ui'

const PACKAGES = [
  {
    name: 'Managed Website',
    price: 'Starting at $1,500',
    description: 'Small businesses that need a credible online presence',
    features: [
      'Custom-designed site',
      'Mobile responsive',
      'Contact form',
      'SEO basics',
      'Analytics',
      'Hosting setup',
    ],
    recommended: false,
  },
  {
    name: 'Website + Lead System',
    price: 'Starting at $3,000',
    description: 'Businesses ready to capture and track leads',
    features: [
      'Everything in Managed Website',
      'Lead capture form',
      'Email notifications',
      'CRM / spreadsheet log',
      'Confirmation messages',
      'Simple reporting',
    ],
    recommended: true,
  },
  {
    name: 'Website + Operations System',
    price: 'Starting at $5,000',
    description: 'Businesses needing booking, payments, and dashboards',
    features: [
      'Everything in Website + Lead System',
      'Booking / intake workflows',
      'Payment & deposit flow',
      'Dashboard',
      'Automated follow-up',
      'System documentation',
    ],
    recommended: false,
  },
]

export default function ServicesPage() {
  return (
    <Container
      style={{ maxWidth: 960, margin: '2rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="lg">
        <Text
          element={{ as: 'h1', size: 'h1' }}
          weight="bold"
          style={{ textAlign: 'center' }}
        >
          Services &amp; Pricing
        </Text>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          {PACKAGES.map((pkg) => (
            <Card
              key={pkg.name}
              style={{
                flex: '1 1 280px',
                border: pkg.recommended
                  ? '2px solid var(--azimuth-color-primary)'
                  : '1px solid var(--azimuth-color-border)',
                position: 'relative',
              }}
              footer={
                <Button
                  variant={pkg.recommended ? 'primary' : 'secondary'}
                  onClick={() => (window.location.href = '/contact')}
                >
                  Get Started
                </Button>
              }
            >
              <Stack spacing="md">
                {pkg.recommended && (
                  <Text
                    element={{ size: 'xs' }}
                    weight="semibold"
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--azimuth-color-primary)',
                    }}
                  >
                    Recommended
                  </Text>
                )}

                <Text element={{ as: 'h2', size: 'h3' }} weight="bold">
                  {pkg.name}
                </Text>

                <Text
                  element={{ size: 'h4' }}
                  weight="bold"
                  style={{ color: 'var(--azimuth-color-primary)' }}
                >
                  {pkg.price}
                </Text>

                <Text element={{ size: 'sm' }} color="secondary">
                  For: {pkg.description}
                </Text>

                <div
                  style={{
                    borderTop: '1px solid var(--azimuth-color-border)',
                    margin: '0.5rem 0',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <Text
                    element={{ size: 'sm' }}
                    weight="semibold"
                    style={{ color: 'var(--azimuth-color-text)' }}
                  >
                    Includes:
                  </Text>
                  {pkg.features.map((feature) => (
                    <Text
                      key={feature}
                      element={{ size: 'sm' }}
                      style={{ color: 'var(--azimuth-color-text-secondary)' }}
                    >
                      {feature}
                    </Text>
                  ))}
                </div>
              </Stack>
            </Card>
          ))}
        </div>

        <div
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--azimuth-radius)',
            background: 'var(--azimuth-color-surface)',
          }}
        >
          <Text
            element={{ size: 'sm' }}
            style={{ color: 'var(--azimuth-color-text-secondary)' }}
          >
            All packages include hosting setup, basic SEO, analytics, and a
            handoff guide. Need something custom?{' '}
            <a
              href="/contact"
              style={{
                color: 'var(--azimuth-color-primary)',
                textDecoration: 'underline',
              }}
            >
              Let&rsquo;s talk
            </a>
            .
          </Text>
        </div>
      </Stack>
    </Container>
  )
}
