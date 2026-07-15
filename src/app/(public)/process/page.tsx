import Link from 'next/link'
import { Container, Text, Stack, Button } from 'azimuth-ui'
import { getPublishedProcessSteps } from '@/lib/content'

interface Step {
  number: number
  title: string
  description: string
}

const FALLBACK_STEPS: Step[] = [
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

export default async function ProcessPage() {
  const dbSteps = await getPublishedProcessSteps()
  const steps: Step[] =
    dbSteps && dbSteps.length > 0
      ? dbSteps.map((s) => ({
          number: s.step_number,
          title: s.title,
          description: s.description,
        }))
      : FALLBACK_STEPS

  return (
    <Container
      maxWidth={640}
      style={{ margin: '2rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="lg">
        <Text element={{ as: 'h1', size: 'h1' }} weight="bold" align="center">
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
            Think this could be a fit?
          </Text>
          <Button variant="primary" asChild>
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </Stack>
    </Container>
  )
}
