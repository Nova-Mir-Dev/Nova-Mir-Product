'use client'
import { Container, Text, Button, Card, Stack } from 'azimuth-ui'
import { PRICING_TIERS } from '@/lib/pricing'

export default function PricingPage() {
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
          Pricing
        </Text>

        <Text element={{ size: 'lg' }} color="secondary">
          Transparent pricing for small businesses. Every project starts here
          and scales with your needs.
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
                flex: '1 1 260px',
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
                  Get a Quote
                </Button>
              }
            >
              <Stack spacing="md">
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
                    Most Popular
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
                  {tier.startingPrice}+
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
            All prices are starting points. Every project is scoped to your
            needs.{' '}
            <a
              href="/contact"
              style={{
                color: 'var(--azimuth-color-primary)',
                textDecoration: 'underline',
              }}
            >
              Let&rsquo;s talk about what works for your budget
            </a>
            .
          </Text>
        </div>
      </Stack>
    </Container>
  )
}
