'use client'

import { Container, Text, Stack, Button, Card, Badge, Grid } from 'azimuth-ui'

const projects = [
  {
    title: 'Nova Mir Website',
    description: 'Custom web development studio site',
    status: 'published' as const,
    href: '/' as const,
  },
]

function displayStatus(status: string): string {
  if (status === 'published') return 'Live'
  return status
}

export default function PortfolioPage() {
  return (
    <Container
      maxWidth={960}
      style={{ margin: '2rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="lg">
        <div style={{ paddingTop: '2rem' }}>
          <Text element={{ as: 'h1', size: 'h1' }} weight="bold" align="center">
            Portfolio
          </Text>
        </div>

        <div style={{ margin: 'auto' }}>
          <Text element={{ size: 'lg' }} color="secondary" align="center">
            Work we&rsquo;re proud of.
          </Text>
        </div>

        <Grid cols="auto" minWidth={280} gap="lg">
          {projects.map((project) => {
            const card = (
              <Card key={project.title} fill>
                <Stack spacing="md">
                  <Text element={{ as: 'h2', size: 'h4' }} weight="bold">
                    {project.title}
                  </Text>
                  <Text element={{ size: 'sm' }} color="secondary">
                    {project.description}
                  </Text>
                  <Badge variant="primary" size="sm">
                    {displayStatus(project.status)}
                  </Badge>
                </Stack>
              </Card>
            )
            return 'href' in project ? (
              <a
                key={project.title}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                {card}
              </a>
            ) : (
              card
            )
          })}
        </Grid>

        <div style={{ textAlign: 'center', paddingTop: '1.5rem' }}>
          <Text
            element={{ size: 'lg' }}
            weight="semibold"
            style={{ margin: 'auto', paddingBottom: '24px' }}
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
