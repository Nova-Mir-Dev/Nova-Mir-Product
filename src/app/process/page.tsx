'use client'

import { Container, Text, Stack, Button } from 'azimuth-ui'

const steps = [
  {
    number: 1,
    title: 'Discovery',
    description:
      'We learn about your business, audience, and goals. You share your vision, and we identify what you need.',
  },
  {
    number: 2,
    title: 'Design & Develop',
    description:
      'We build your site with mobile-first design, performance best practices, and regular check-ins so you can see progress.',
  },
  {
    number: 3,
    title: 'Launch & Grow',
    description:
      'We deploy, set up analytics and lead capture, and hand off everything with clear documentation so you can focus on running your business.',
  },
]

export default function ProcessPage() {
  return (
    <Container
      style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="lg">
        <Text
          element={{ as: 'h1', size: 'h1' }}
          weight="bold"
          style={{ textAlign: 'center' }}
        >
          How It Works
        </Text>

        <Stack spacing="lg">
          {steps.map((step, i) => (
            <div key={step.number} style={{ display: 'flex', gap: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <div
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1rem',
                    flexShrink: 0,
                    color: '#fff',
                    background: 'var(--azimuth-color-primary)',
                  }}
                >
                  {step.number}
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      width: '2px',
                      flex: 1,
                      minHeight: '2rem',
                      background: 'var(--azimuth-color-border)',
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  paddingBottom: i < steps.length - 1 ? '2.5rem' : '0',
                }}
              >
                <Text
                  element={{ as: 'h2', size: 'h4' }}
                  weight="semibold"
                  style={{ marginBottom: '0.5rem' }}
                >
                  {step.title}
                </Text>
                <Text element={{ size: 'base' }} color="secondary">
                  {step.description}
                </Text>
              </div>
            </div>
          ))}
        </Stack>

        <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
          <Text
            element={{ size: 'lg' }}
            weight="semibold"
            style={{ marginBottom: '1rem' }}
          >
            Ready to get started?
          </Text>
          <Button
            variant="primary"
            onClick={() => (window.location.href = '/contact')}
          >
            Get in Touch
          </Button>
        </div>
      </Stack>
    </Container>
  )
}
