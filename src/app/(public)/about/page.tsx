'use client'

import { Container, Text, Stack, Button, Card } from 'azimuth-ui'

export default function AboutPage() {
  return (
    <Container
      maxWidth={640}
      style={{ padding: '3rem 2rem', margin: '0 auto' }}
    >
      <Stack spacing="lg">
        <div style={{ paddingTop: '2rem' }}>
          <Text element={{ as: 'h1', size: 'h1' }} weight="bold" align="center">
            Hi, we&rsquo;re Nova Mir
          </Text>
        </div>

        <Text>
          Nova Mir started with a simple belief — that good tools
          shouldn&rsquo;t require a manual. We build websites and systems that
          handle the details so you can focus on running your business. No
          bloat, no complexity, just things that work.
        </Text>

        <div style={{ paddingTop: '1rem' }}>
          <Text element={{ as: 'h2', size: 'h3' }} weight="semibold">
            Our philosophy
          </Text>
        </div>

        <Text>
          We don&rsquo;t do templates. We don&rsquo;t upsell you on features you
          don&rsquo;t need. We figure out what your business actually requires
          and build exactly that — nothing less, nothing more. You get a site
          that loads fast, works on every device, and actually helps you get
          customers.
        </Text>

        <div style={{ paddingTop: '1rem' }}>
          <Text element={{ as: 'h2', size: 'h3' }} weight="semibold">
            What we build
          </Text>
        </div>

        <Stack spacing="md">
          <Card>
            <Stack spacing="sm">
              <Text weight="semibold">Websites</Text>
              <Text element={{ size: 'sm' }} color="secondary">
                Landing pages, multi-page sites, portfolios — built mobile-first
                and performance-conscious.
              </Text>
            </Stack>
          </Card>
          <Card>
            <Stack spacing="sm">
              <Text weight="semibold">Lead systems</Text>
              <Text element={{ size: 'sm' }} color="secondary">
                Contact forms, booking calendars, payment flows — the stuff that
                turns visitors into customers.
              </Text>
            </Stack>
          </Card>
          <Card>
            <Stack spacing="sm">
              <Text weight="semibold">Operations</Text>
              <Text element={{ size: 'sm' }} color="secondary">
                Dashboards, customer portals, internal tools — systems that save
                you hours every week.
              </Text>
            </Stack>
          </Card>
        </Stack>

        <div style={{ paddingTop: '1rem' }}>
          <Text element={{ as: 'h2', size: 'h3' }} weight="semibold">
            How we work
          </Text>
        </div>

        <Stack spacing="md">
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--azimuth-radius)',
              border: '1px solid var(--azimuth-color-border)',
              background: 'var(--azimuth-color-surface)',
            }}
          >
            <Text weight="semibold">1. Understand</Text>
            <Text element={{ size: 'sm' }} color="secondary">
              We learn your business, audience, and goals before writing a line
              of code.
            </Text>
          </div>
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--azimuth-radius)',
              border: '1px solid var(--azimuth-color-border)',
              background: 'var(--azimuth-color-surface)',
            }}
          >
            <Text weight="semibold">2. Build</Text>
            <Text element={{ size: 'sm' }} color="secondary">
              We design and develop your site — no fluff, no scope creep.
            </Text>
          </div>
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--azimuth-radius)',
              border: '1px solid var(--azimuth-color-border)',
              background: 'var(--azimuth-color-surface)',
            }}
          >
            <Text weight="semibold">3. Launch</Text>
            <Text element={{ size: 'sm' }} color="secondary">
              We deploy, set up analytics, and hand off with clear
              documentation.
            </Text>
          </div>
        </Stack>

        <div style={{ paddingTop: '1rem' }}>
          <Button
            variant="primary"
            onClick={() => (window.location.href = '/contact')}
          >
            Let&rsquo;s talk about your project
          </Button>
        </div>
      </Stack>
    </Container>
  )
}
