'use client'

import { Container, Text, Stack, Button, Card } from 'azimuth-ui'

export default function AboutPage() {
  return (
    <Container
      style={{ padding: '3rem 2rem', maxWidth: 640, margin: '0 auto' }}
    >
      <Stack spacing="lg">
        <div style={{ paddingTop: '2rem' }}>
          <Text
            element={{ as: 'h1', size: 'h1' }}
            weight="bold"
            style={{ textAlign: 'center' }}
          >
            Hi, I&rsquo;m the founder
          </Text>
        </div>

        <Text>
          I started Nova Mir because I saw too many small businesses getting
          taken for a ride by agencies that charge enterprise prices for a basic
          website. A friend&rsquo;s bakery paid $8,000 for a site that
          couldn&rsquo;t even take orders. I built them a better one in a
          weekend.
        </Text>

        <Text>
          That weekend turned into a business. Nova Mir is me — one person who
          builds websites and the systems that make them useful. No sales team,
          no account managers, no overhead. Just direct, transparent work.
        </Text>

        <div style={{ paddingTop: '1rem' }}>
          <Text element={{ as: 'h2', size: 'h3' }} weight="semibold">
            My philosophy
          </Text>
        </div>

        <Text>
          I don&rsquo;t do templates. I don&rsquo;t upsell you on features you
          don&rsquo;t need. I figure out what your business actually requires
          and build exactly that — nothing less, nothing more. You get a site
          that loads fast, works on every device, and actually helps you get
          customers.
        </Text>

        <div style={{ paddingTop: '1rem' }}>
          <Text element={{ as: 'h2', size: 'h3' }} weight="semibold">
            What I build
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
            How I work
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
              I learn your business, audience, and goals before writing a line
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
              I design and develop your site — no fluff, no scope creep.
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
              I deploy, set up analytics, and hand off with clear documentation.
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
