'use client'

import { Container, Text, Stack, Button, Card } from 'azimuth-ui'

const projects = [
  {
    title: 'Nova Mir Website',
    description: 'Custom web development studio site',
    status: 'Live' as const,
    href: '/' as const,
  },
  {
    title: 'jcrose.dev',
    description:
      'Founder personal project — Next.js, dark mode, blog, project showcase',
    status: 'Live' as const,
    href: 'https://jcrose.dev' as const,
  },
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

        <div style={{ textAlign: 'center' }}>
          <Text element={{ size: 'lg' }} color="secondary">
            Work we&rsquo;re proud of.
          </Text>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {projects.map((project) => {
            const card = (
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
            )
            return 'href' in project ? (
              <a
                key={project.title}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {card}
              </a>
            ) : (
              card
            )
          })}
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
