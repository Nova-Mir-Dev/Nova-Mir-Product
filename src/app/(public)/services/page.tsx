'use client'
import { Container, Text, Button, Card, Stack } from 'azimuth-ui'
import { PRICING_TIERS } from '@/lib/pricing'

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
          {PRICING_TIERS.map((tier, i) => (
            <Card
              key={tier.name}
              style={{
                flex: '1 1 280px',
                border:
                  i === 1
                    ? '2px solid var(--azimuth-color-primary)'
                    : '1px solid var(--azimuth-color-border)',
                position: 'relative',
              }}
              footer={
                <Button
                  variant={i === 1 ? 'primary' : 'secondary'}
                  onClick={() => (window.location.href = '/contact')}
                >
                  Get Started
                </Button>
              }
            >
              <Stack spacing="md" style={{ flex: 1 }}>
                {i === 1 && (
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
                  {tier.name}
                </Text>

                <Text
                  element={{ size: 'h4' }}
                  weight="bold"
                  style={{ color: 'var(--azimuth-color-primary)' }}
                >
                  Starting at {tier.startingPrice}
                </Text>

                <Text element={{ size: 'sm' }} color="secondary">
                  For: {tier.description}
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
                    marginTop: 'auto',
                  }}
                >
                  <Text
                    element={{ size: 'sm' }}
                    weight="semibold"
                    style={{ color: 'var(--azimuth-color-text)' }}
                  >
                    Includes:
                  </Text>
                  {tier.features.map((feature) => (
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

        <Card
          style={{
            border: '2px dashed var(--azimuth-color-primary)',
            background:
              'color-mix(in srgb, var(--azimuth-color-primary) 6%, transparent)',
          }}
        >
          <Stack spacing="sm">
            <Text element={{ as: 'h3', size: 'h4' }} weight="bold">
              Looking for a founding client slot?
            </Text>
            <Text element={{ size: 'sm' }}>
              First 3 clients at a flat $2,500 rate.{' '}
              <a
                href="/pricing"
                style={{
                  color: 'var(--azimuth-color-primary)',
                  textDecoration: 'underline',
                }}
              >
                See details on our pricing page
              </a>
              .
            </Text>
            <Text element={{ size: 'sm' }} style={{ marginTop: '0.5rem', color: 'var(--azimuth-color-text-secondary)' }}>
              Maintenance retainer from $100–$200/month after launch.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}
