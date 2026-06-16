import Link from 'next/link'
import { Button, Card, Container, Text, Badge } from 'azimuth-ui'
import { PRICING_TIERS } from '@/lib/pricing'
import styles from './landing.module.css'

function formatPrice(price: number): string {
  return '$' + price.toLocaleString()
}

const TIER_DATA = PRICING_TIERS.map((tier, i) => ({
  name: tier.name,
  priceRange: `${formatPrice(tier.startingPrice)}${i === PRICING_TIERS.length - 1 ? '+' : ''}`,
  popular: i === 1,
  features: tier.features,
}))

const PRICING_SUMMARY = PRICING_TIERS.map((tier, i) => ({
  name: tier.name,
  range: `${formatPrice(tier.startingPrice)}${i === PRICING_TIERS.length - 1 ? '+' : ''}`,
  oneLiner: [
    'Custom site that builds credibility.',
    'Site + automated lead capture.',
    'Full system with booking and dashboards.',
  ][i],
  popular: i === 1,
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
]

export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        <Container size="lg">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Your website should be bringing in customers — not collecting
              dust.
            </h1>
            <p className={styles.heroSubtitle}>
              Whether you run a law firm, a gym, or a plumbing business — we
              build websites and systems that bring in customers and save you
              time.
            </p>
            <div className={styles.heroActions}>
              <Button variant="primary" size="lg" asChild>
                <Link href="/contact">Get Started</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/process">See How It Works</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container size="lg">
          <Text
            element={{ as: 'h2', size: 'h2' }}
            weight="semibold"
            className={styles.sectionTitle}
          >
            Services
          </Text>
          <div className={styles.tierGrid}>
            {TIER_DATA.map((tier) => (
              <Card
                key={tier.name}
                className={`${styles.tierCard} ${tier.popular ? styles.tierCardPopular : ''}`}
              >
                <div className={styles.tierCardInner}>
                  {tier.popular && (
                    <Badge
                      variant="accent"
                      size="sm"
                      className={styles.mostPopularBadge}
                    >
                      Most Popular
                    </Badge>
                  )}
                  <div className={styles.tierHeader}>
                    <Text weight="bold" element={{ as: 'h3', size: 'h5' }}>
                      {tier.name}
                    </Text>
                    <Text weight="bold" className={styles.priceRange}>
                      {tier.priceRange}
                    </Text>
                  </div>
                  <div className={styles.divider} />
                  <ul className={styles.featureList}>
                    {tier.features.map((f) => (
                      <li key={f} className={styles.featureItem}>
                        <span className={styles.checkmark}>&#10003;</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={tier.popular ? 'primary' : 'secondary'}
                    fullWidth
                    asChild
                  >
                    <Link href="/services">Learn more about {tier.name}</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container size="lg">
          <Text
            element={{ as: 'h2', size: 'h2' }}
            weight="semibold"
            className={styles.sectionTitle}
          >
            How It Works
          </Text>
          <div className={styles.stepsGrid}>
            {STEPS.map((step) => (
              <div key={step.number} className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.number}</div>
                <Text
                  weight="semibold"
                  element={{ size: 'lg' }}
                  className={styles.stepTitle}
                >
                  {step.title}
                </Text>
                <Text
                  element={{ size: 'sm' }}
                  color="secondary"
                  className={styles.stepDesc}
                >
                  {step.description}
                </Text>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container size="lg">
          <Text
            element={{ as: 'h2', size: 'h2' }}
            weight="semibold"
            className={styles.sectionTitle}
          >
            Recent Work
          </Text>
          <div className={styles.portfolioGrid}>
            {PROJECTS.map((project, i) => (
              <Link
                key={i}
                href={project.href}
                className={styles.portfolioLink}
              >
                <Card className={styles.portfolioCard}>
                  <div className={styles.portfolioThumb}>
                    Project Screenshot
                  </div>
                  <Text weight="semibold">{project.title}</Text>
                  {project.description && (
                    <Text
                      element={{ size: 'sm' }}
                      color="secondary"
                      className={styles.portfolioDesc}
                    >
                      {project.description}
                    </Text>
                  )}
                </Card>
              </Link>
            ))}
            {[...Array(2)].map((_, i) => (
              <Card key={`ph-${i}`} className={styles.portfolioCard}>
                <div className={styles.portfolioThumb}>
                  <Text color="muted" element={{ size: 'sm' }}>
                    Coming soon
                  </Text>
                </div>
                <Text weight="semibold" color="muted">
                  More coming soon
                </Text>
              </Card>
            ))}
          </div>
          <div className={styles.sectionFooter}>
            <Button variant="secondary" asChild>
              <Link href="/portfolio">View All Work</Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <Container size="lg">
          <Text
            element={{ as: 'h2', size: 'h2' }}
            weight="semibold"
            className={styles.sectionTitle}
          >
            Pricing
          </Text>
          <div className={styles.pricingGrid}>
            {PRICING_SUMMARY.map((tier) => (
              <Card
                key={tier.name}
                className={`${styles.pricingCard} ${tier.popular ? styles.pricingCardPopular : ''}`}
              >
                {tier.popular && (
                  <Badge
                    variant="accent"
                    size="sm"
                    className={styles.mostPopularBadge}
                  >
                    Most Popular
                  </Badge>
                )}
                <Text weight="semibold">{tier.name}</Text>
                <Text weight="bold" className={styles.priceRange}>
                  {tier.range}
                </Text>
                <Text element={{ size: 'sm' }} color="muted">
                  {tier.oneLiner}
                </Text>
              </Card>
            ))}
          </div>
          <div className={styles.sectionFooter}>
            <Button variant="secondary" asChild>
              <Link href="/pricing">See Full Pricing</Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className={styles.section}>
        <Container size="lg">
          <Text
            element={{ as: 'h2', size: 'h2' }}
            weight="semibold"
            className={styles.sectionTitle}
          >
            Trusted by businesses like yours
          </Text>
          <div className={styles.testimonialGrid}>
            {[1, 2, 3].map((i) => (
              <Card key={i} className={styles.testimonialCard}>
                <div className={styles.testimonialBadge}>Coming soon</div>
                <div className={styles.testimonialContent}>
                  <div className={styles.testimonialQuote}>
                    <Text color="muted" element={{ size: 'sm' }}>
                      Real testimonials from our clients will appear here once
                      we complete our first projects.
                    </Text>
                  </div>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.avatarPlaceholder} />
                    <div>
                      <Text
                        weight="semibold"
                        element={{ size: 'sm' }}
                        color="muted"
                      >
                        Client Name
                      </Text>
                      <Text element={{ size: 'xs' }} color="muted">
                        Business
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.ctaSection}>
        <Container size="lg">
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to get started?</h2>
            <p className={styles.ctaSubtitle}>
              Tell me about your project and I&apos;ll follow up within 1–2
              business days.
            </p>
            <Button variant="primary" size="lg" asChild>
              <Link href="/contact">Start Your Project</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  )
}
