import Link from 'next/link'
import { Button, Card, Container, Text, Badge } from 'azimuth-ui'
import { PRICING_TIERS } from '@/lib/pricing'
import { HeroContent } from './_components/hero-headlines'
import styles from './landing.module.css'

function formatPrice(price: number): string {
  return '$' + price.toLocaleString()
}

const TIER_DATA = PRICING_TIERS.map((tier, i) => ({
  name: tier.name,
  priceRange: `${formatPrice(tier.startingPrice)}${i === PRICING_TIERS.length - 1 ? '+' : i === 1 ? '' : '+'}`,
  popular: i === 1,
  features: tier.features,
}))

const PRICING_SUMMARY = PRICING_TIERS.map((tier, i) => ({
  name: tier.name,
  range: `${formatPrice(tier.startingPrice)}${i === PRICING_TIERS.length - 1 ? '+' : i === 1 ? '' : '+'}`,
  oneLiner: [
    'Custom site that builds credibility.',
    'Site + lead capture + automated follow-up.',
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
            <HeroContent
              fallback={{
                id: 'fallback',
                headline: 'A new kind of website for your business.',
                subtitle:
                  'No templates. No runaround. Just a site that actually works for you.',
                cta_label: 'Get Started',
                cta_href: '/contact',
              }}
            />
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
                    <Link href="/services">Learn More</Link>
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
                    <Text color="muted" element={{ size: 'sm' }}>
                      Nova Mir
                    </Text>
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
            How we&rsquo;re different
          </Text>
          <div className={styles.testimonialGrid}>
            <Card className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                <Text weight="semibold">No templates</Text>
                <Text element={{ size: 'sm' }} color="secondary">
                  Every site is built from scratch for your specific business
                  needs. No cookie-cutter solutions.
                </Text>
              </div>
            </Card>
            <Card className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                <Text weight="semibold">Transparent pricing</Text>
                <Text element={{ size: 'sm' }} color="secondary">
                  What you see is what you pay. No hidden fees, no surprise
                  upsells, no account managers.
                </Text>
              </div>
            </Card>
            <Card className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                <Text weight="semibold">Built to last</Text>
                <Text element={{ size: 'sm' }} color="secondary">
                  Modern stack, performance-optimized, and easy to maintain.
                  Your site grows with your business.
                </Text>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <section className={styles.ctaSection}>
        <Container size="lg">
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Think this could be a fit?</h2>
            <p className={styles.ctaSubtitle}>
              Tell us about your project and we&apos;ll follow up within 1–2
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
