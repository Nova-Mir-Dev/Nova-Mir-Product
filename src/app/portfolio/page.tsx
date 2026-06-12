'use client'

import { Container, Text, Stack, Button, Card } from 'azimuth-ui'

const projects = [
  {
    title: 'Nova Mir Website',
    description: 'Custom web development studio site',
    status: 'In progress' as const,
  },
]

const placeholders = [
  {
    title: 'Your Project Here',
    description: "Every business has a story. Let's tell yours online.",
  },
  {
    title: 'Another Success Story',
    description: 'Our next project could be yours.',
  },
  { title: 'Coming Soon', description: "We're just getting started." },
]

export default function PortfolioPage() {
  return (
    <Container
      style={{ maxWidth: 960, margin: '2rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="lg">
        <div style={{ paddingTop: '2rem' }}>
          <Text
            element={{ as: 'h1', size: 'h1' }}
            weight="bold"
            style={{ textAlign: 'center' }}
          >
            Portfolio
          </Text>
        </div>

        <Text
          element={{ size: 'lg' }}
          color="secondary"
          style={{ textAlign: 'center' }}
        >
          Work we&rsquo;re proud of — and work we&rsquo;re looking forward to
          building with you.
        </Text>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {projects.map((project) => (
            <Card
              key={project.title}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <Stack spacing="md">
                <Text element={{ as: 'h2', size: 'h4' }} weight="bold">
                  {project.title}
                </Text>
                <Text element={{ size: 'sm' }} color="secondary">
                  {project.description}
                </Text>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    background: 'var(--azimuth-color-primary)',
                    color: '#fff',
                    alignSelf: 'flex-start',
                  }}
                >
                  {project.status}
                </span>
              </Stack>
            </Card>
          ))}

          {placeholders.map((item) => (
            <Card
              key={item.title}
              style={{
                display: 'flex',
                flexDirection: 'column',
                border: '2px dashed var(--azimuth-color-border)',
                background: 'transparent',
                opacity: 0.6,
              }}
            >
              <Stack spacing="md">
                <Text
                  element={{ as: 'h2', size: 'h4' }}
                  weight="bold"
                  color="secondary"
                >
                  {item.title}
                </Text>
                <Text element={{ size: 'sm' }} color="muted">
                  {item.description}
                </Text>
              </Stack>
            </Card>
          ))}
        </div>

        <div style={{ textAlign: 'center', paddingTop: '1.5rem' }}>
          <Text
            element={{ size: 'lg' }}
            weight="semibold"
            style={{ marginBottom: '1rem' }}
          >
            Ready to be next?
          </Text>
          <Button
            variant="primary"
            onClick={() => (window.location.href = '/contact')}
          >
            Start Your Project
          </Button>
        </div>
      </Stack>
    </Container>
  )
}
