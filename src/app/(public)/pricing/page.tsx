'use client'
import { useEffect, useState } from 'react'
import { Container, Text, Button, Card, Stack, Divider } from 'azimuth-ui'
import {
  PRICING_TIERS,
  getFoundingOfferLabel,
  getMaintenanceRetainer,
} from '@/lib/pricing'

interface DisplayTier {
  name: string
  startingPrice: number
  description: string
  features: string[]
  isFeatured: boolean
}

function fallbackTiers(): DisplayTier[] {
  return PRICING_TIERS.map((t, i) => ({
    name: t.name,
    startingPrice: t.startingPrice,
    description: t.description,
    features: t.features,
    isFeatured: i === 1,
  }))
}

export default function PricingPage() {
  const [tiers, setTiers] = useState<DisplayTier[]>(fallbackTiers)

  useEffect(() => {
    let cancelled = false
    fetch('/api/content/pricing')
      .then((r) => (r.ok ? r.json() : fallbackTiers()))
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setTiers(data)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Container
      maxWidth={960}
      style={{ margin: '2rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="lg">
        <Text element={{ as: 'h1', size: 'h1' }} weight="bold" align="center">
          Pricing
        </Text>

        <div style={{ textAlign: 'center' }}>
          <Text element={{ size: 'lg' }} color="secondary" align="center">
            Transparent pricing for small businesses. Every project starts here
            and scales with your needs.
          </Text>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          {tiers.map((tier) => {
            const featured = tier.isFeatured
            return (
              <Card
                key={tier.name}
                style={{
                  flex: '1 1 260px',
                  border: featured
                    ? '2px solid var(--azimuth-color-primary)'
                    : '1px solid var(--azimuth-color-border)',
                  position: 'relative',
                }}
                footer={
                  <Button
                    variant={featured ? 'primary' : 'secondary'}
                    onClick={() => (window.location.href = '/contact')}
                  >
                    Get a Quote
                  </Button>
                }
              >
                <Stack spacing="md" style={{ flex: 1 }}>
                  {featured && (
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
                    ${tier.startingPrice.toLocaleString()}
                    {featured ? '' : '+'}
                  </Text>
                  {featured && (
                    <Text
                      element={{ size: 'xs' }}
                      color="secondary"
                      style={{ marginTop: '-0.25rem' }}
                    >
                      Founding rate — limited to 3 slots
                    </Text>
                  )}

                  <Divider margin="sm" />

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      marginTop: 'auto',
                    }}
                  >
                    {tier.features.map((feature) => (
                      <Text
                        key={feature}
                        element={{ size: 'sm' }}
                        style={{
                          color: 'var(--azimuth-color-text-secondary)',
                        }}
                      >
                        {feature}
                      </Text>
                    ))}
                  </div>
                </Stack>
              </Card>
            )
          })}
        </div>

        <Card
          variant="dashed"
          style={{
            background:
              'color-mix(in srgb, var(--azimuth-color-primary) 6%, transparent)',
          }}
        >
          <Stack spacing="md">
            <Text element={{ as: 'h2', size: 'h3' }} weight="bold">
              Founding Client Program
            </Text>
            <Text element={{ size: 'base' }}>
              {getFoundingOfferLabel()} &mdash; a limited-time opportunity to
              get a custom website at a founding price.
            </Text>
            <div>
              <Text element={{ size: 'sm' }} weight="semibold">
                In exchange, you provide:
              </Text>
              <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0 }}>
                <li>
                  <Text element={{ size: 'sm' }}>
                    A detailed testimonial about your experience
                  </Text>
                </li>
                <li>
                  <Text element={{ size: 'sm' }}>
                    Permission to feature your project as a case study
                  </Text>
                </li>
                <li>
                  <Text element={{ size: 'sm' }}>
                    Referrals to 3+ other businesses who could benefit
                  </Text>
                </li>
              </ul>
            </div>
            <Text element={{ size: 'sm' }} color="secondary">
              <strong>Timeboxed:</strong> first 3 clients or first 60 days
              &mdash; whichever comes first. After slots are filled, pricing
              returns to standard rates.
            </Text>
            <Text
              element={{ size: 'sm' }}
              color="secondary"
              style={{ marginTop: '1rem' }}
            >
              Maintenance retainer available at {getMaintenanceRetainer()} after
              launch &mdash; hosting checks, content updates, and priority
              support.
            </Text>
            <Button
              variant="primary"
              onClick={() => (window.location.href = '/contact')}
            >
              Claim a Launch Slot
            </Button>
          </Stack>
        </Card>

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
