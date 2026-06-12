'use client'

import { Button, Card, Container, Stack, Text, Badge } from 'azimuth-ui'
import { PRICING_TIERS } from '@/lib/pricing'

const PRICE_RANGES = ['$1,000–$2,500', '$1,500–$4,500', '$3,000–$10,000+'] as const
const SHORT_FEATURES: string[][] = [
  [
    'Custom-designed, mobile-friendly site',
    'Contact forms & map integration',
    'Basic SEO & analytics setup',
    'Hosting & security included',
  ],
  [
    'Everything in Managed Website',
    'Automated lead capture & CRM',
    'Email follow-up sequences',
    'Monthly performance reports',
  ],
  [
    'Everything in Website + Lead System',
    'Online bookings & payments',
    'Customer dashboard & automations',
    'Priority support & maintenance',
  ],
]
const TIERS = PRICING_TIERS.map((tier, i) => ({
  title: tier.name,
  price: PRICE_RANGES[i]!,
  popular: i === 1,
  features: SHORT_FEATURES[i]!,
  href: '/services',
}))

const STEPS = [
  {
    number: 1,
    title: 'Discovery',
    description:
      'We learn your business, audience, and goals before writing a line of code.',
  },
  {
    number: 2,
    title: 'Build',
    description:
      'We design and develop your site with regular check-ins so nothing surprises you.',
  },
  {
    number: 3,
    title: 'Launch',
    description:
      'We deploy, set up analytics, and hand off everything with clear documentation.',
  },
]

const PROJECTS = [
  {
    title: 'Nova Mir Website',
    description: 'Studio site for a web development business',
    href: '/portfolio',
  },
  { title: 'More coming soon', description: '', href: '' },
  { title: 'More coming soon', description: '', href: '' },
]

export default function Home() {
  return (
    <Container
      style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}
    >
      <Stack spacing="2xl">
        {/* 1. Hero Section */}
        <section style={{ textAlign: 'center', padding: '6rem 0 4rem' }}>
          <Text
            element={{ as: 'h1', size: 'h1' }}
            weight="bold"
            style={{
              maxWidth: 760,
              margin: '0 auto 1.25rem',
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              lineHeight: 1.15,
            }}
          >
            Your website should be bringing in customers — not collecting
            dust.
          </Text>
          <Text
            element={{ size: 'lg' }}
            style={{
              color: 'var(--azimuth-color-text-secondary)',
              maxWidth: 640,
              margin: '0 auto 2.5rem',
              fontSize: '1.15rem',
              lineHeight: 1.6,
            }}
          >
            Whether you run a law firm, a gym, or a plumbing business — we
            build websites and systems that bring in customers and save you
            time.
          </Text>
          <Stack direction="horizontal" spacing="sm" justify="center" wrap>
            <Button
              variant="primary"
              size="lg"
              onClick={() => (window.location.href = '/contact')}
            >
              Get Started
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => (window.location.href = '/process')}
            >
              See How It Works
            </Button>
          </Stack>
        </section>

        {/* 2. Services Section */}
        <section style={{ padding: '4rem 0' }}>
          <Text
            element={{ as: 'h2', size: 'h2' }}
            weight="semibold"
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            Services
          </Text>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              alignItems: 'stretch',
            }}
          >
            {TIERS.map((tier) => (
              <Card
                key={tier.title}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: tier.popular
                    ? '2px solid var(--azimuth-color-primary)'
                    : '1px solid var(--azimuth-color-border)',
                  transform: tier.popular ? 'scale(1.04)' : undefined,
                  position: 'relative',
                  zIndex: tier.popular ? 1 : 0,
                }}
              >
                <div
                  style={{
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    flex: 1,
                  }}
                >
                  {tier.popular && (
                    <Badge
                      variant="accent"
                      size="sm"
                      style={{ alignSelf: 'flex-start' }}
                    >
                      Most Popular
                    </Badge>
                  )}
                  <Stack spacing="xs">
                    <Text weight="bold" element={{ size: 'h5' }}>
                      {tier.title}
                    </Text>
                    <Text
                      weight="bold"
                      style={{
                        color: 'var(--azimuth-color-primary)',
                        fontSize: '1.5rem',
                      }}
                    >
                      {tier.price}
                    </Text>
                  </Stack>
                  <div
                    style={{
                      borderTop: '1px solid var(--azimuth-color-border)',
                      margin: '0.25rem 0',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                      flex: 1,
                    }}
                  >
                    {tier.features.map((f) => (
                      <Text
                        key={f}
                        element={{ size: 'sm' }}
                        style={{
                          color: 'var(--azimuth-color-text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span style={{ color: 'var(--azimuth-color-primary)' }}>
                          &#10003;
                        </span>
                        {f}
                      </Text>
                    ))}
                  </div>
                  <Button
                    variant={tier.popular ? 'primary' : 'secondary'}
                    fullWidth
                    onClick={() => (window.location.href = tier.href)}
                  >
                    Learn More
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 3. Process Section */}
        <section style={{ padding: '4rem 0' }}>
          <Text
            element={{ as: 'h2', size: 'h2' }}
            weight="semibold"
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            How It Works
          </Text>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2rem',
            }}
          >
            {STEPS.map((step) => (
              <div key={step.number} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: 'var(--azimuth-color-on-primary)',
                    background: 'var(--azimuth-color-primary)',
                    margin: '0 auto 1rem',
                  }}
                >
                  {step.number}
                </div>
                <Text
                  weight="semibold"
                  element={{ size: 'lg' }}
                  style={{ marginBottom: '0.5rem' }}
                >
                  {step.title}
                </Text>
                <Text
                  element={{ size: 'sm' }}
                  style={{
                    color: 'var(--azimuth-color-text-secondary)',
                    maxWidth: 280,
                    margin: '0 auto',
                  }}
                >
                  {step.description}
                </Text>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Portfolio Section */}
        <section style={{ padding: '4rem 0' }}>
          <Text
            element={{ as: 'h2', size: 'h2' }}
            weight="semibold"
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            Recent Work
          </Text>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {PROJECTS.map((project, i) => (
              <Card
                key={i}
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    aspectRatio: '16 / 9',
                    borderRadius: 'var(--azimuth-radius)',
                    background: 'var(--azimuth-color-surface)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--azimuth-color-text-secondary)',
                    fontSize: '0.875rem',
                    border: '1px solid var(--azimuth-color-border)',
                  }}
                >
                  {project.description ? 'Project Screenshot' : 'Coming Soon'}
                </div>
                <Text weight="semibold" style={{ marginBottom: '0.25rem' }}>
                  {project.title}
                </Text>
                {project.description && (
                  <Text
                    element={{ size: 'sm' }}
                    style={{
                      color: 'var(--azimuth-color-text-secondary)',
                      marginBottom: '1rem',
                      flex: 1,
                    }}
                  >
                    {project.description}
                  </Text>
                )}
              </Card>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Button
              variant="secondary"
              onClick={() => (window.location.href = '/portfolio')}
            >
              View All Work
            </Button>
          </div>
        </section>

        {/* 5. Pricing Summary */}
        <section style={{ padding: '4rem 0' }}>
          <Text
            element={{ as: 'h2', size: 'h2' }}
            weight="semibold"
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            Pricing
          </Text>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
            }}
          >
            {TIERS.map((tier) => (
              <Card
                key={tier.title}
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  border: tier.popular
                    ? '2px solid var(--azimuth-color-primary)'
                    : '1px solid var(--azimuth-color-border)',
                  position: 'relative',
                }}
              >
                {tier.popular && (
                  <Badge
                    variant="accent"
                    size="sm"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    Most Popular
                  </Badge>
                )}
                <Text weight="semibold">{tier.title}</Text>
                <Text
                  weight="bold"
                  style={{
                    color: 'var(--azimuth-color-primary)',
                    fontSize: '1.25rem',
                  }}
                >
                  {tier.price}
                </Text>
                <Text
                  element={{ size: 'sm' }}
                  style={{ color: 'var(--azimuth-color-text-secondary)' }}
                >
                  {tier.features[0]}
                </Text>
              </Card>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Button
              variant="secondary"
              onClick={() => (window.location.href = '/pricing')}
            >
              See Full Pricing
            </Button>
          </div>
        </section>

        {/* 6. Bottom CTA */}
        <section
          style={{
            textAlign: 'center',
            padding: '5rem 0',
            borderTop: '1px solid var(--azimuth-color-border)',
          }}
        >
          <Text
            element={{ as: 'h2', size: 'h2' }}
            weight="bold"
            style={{ marginBottom: '0.75rem' }}
          >
            Ready to get started?
          </Text>
          <Text
            element={{ size: 'lg' }}
            style={{
              color: 'var(--azimuth-color-text-secondary)',
              maxWidth: 520,
              margin: '0 auto 2rem',
              fontSize: '1.1rem',
            }}
          >
            Tell me about your project and I&apos;ll follow up within 1–2
            business days.
          </Text>
          <Button
            variant="primary"
            size="lg"
            onClick={() => (window.location.href = '/contact')}
          >
            Start Your Project
          </Button>
        </section>
      </Stack>
    </Container>
  )
}
