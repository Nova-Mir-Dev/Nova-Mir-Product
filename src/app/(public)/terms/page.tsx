import { Container, Text, Stack } from 'azimuth-ui'
import { APP_CONFIG } from '@/lib/navigation'

const sections = [
  {
    title: 'Introduction',
    body: 'These Terms of Service govern your use of the website and services provided by Nova Mir. By accessing our site or engaging our services, you agree to these terms.',
  },
  {
    title: 'Services',
    body: 'Nova Mir provides web development services including custom website design, development, deployment, and ongoing maintenance as agreed upon in each project scope. Specific deliverables, timelines, and fees are outlined in individual project agreements.',
  },
  {
    title: 'Payment Terms',
    body: 'Payment terms are specified in each project agreement. A deposit is typically required before work begins, with the remaining balance due upon completion or as otherwise agreed. Payments are processed via the methods specified in your agreement. Late payments may result in project delays or suspension of services.',
  },
  {
    title: 'Timeline & Delivery',
    body: 'Project timelines are estimates provided in good faith. Delays may occur due to unforeseen circumstances, changes in scope, or delays in client-provided materials. We will communicate any expected delays promptly.',
  },
  {
    title: 'Client Responsibilities',
    body: 'You agree to provide timely feedback, necessary content (text, images, branding assets), and access to any third-party accounts required for the project. Delays in providing these materials may affect the project timeline.',
  },
  {
    title: 'Intellectual Property',
    body: 'Upon full payment, you own the final deliverables. Nova Mir retains the right to display completed work in our portfolio unless otherwise agreed. We do not claim ownership of your content, trademarks, or business materials.',
  },
  {
    title: 'Limitation of Liability',
    body: 'Nova Mir is not liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability is limited to the amount paid for the specific project giving rise to the claim.',
  },
  {
    title: 'Termination',
    body: 'Either party may terminate a project agreement with written notice. Upon termination, you are invoiced for work completed up to that point. Any deposit amounts exceeding completed work will be refunded.',
  },
  {
    title: 'Governing Law',
    body: 'These terms are governed by the laws of the Province of Ontario, Canada. Any disputes shall be resolved in the courts of Ontario.',
  },
  {
    title: 'Contact Information',
    body: `For questions about these terms, please contact us at ${APP_CONFIG.email}.`,
  },
]

export default function TermsPage() {
  return (
    <Container
      style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="2xl">
        <div>
          <Text
            element={{ as: 'h1', size: 'h1' }}
            weight="bold"
            style={{ textAlign: 'center' }}
          >
            Terms of Service
          </Text>
          <Text
            element={{ size: 'sm' }}
            color="muted"
            style={{ marginTop: '0.25rem' }}
          >
            Last updated: June 2026
          </Text>
        </div>

        <Stack spacing="xl">
          {sections.map((section) => (
            <div key={section.title}>
              <Text
                element={{ as: 'h2', size: 'h4' }}
                weight="semibold"
                style={{ marginBottom: '0.5rem' }}
              >
                {section.title}
              </Text>
              <Text element={{ size: 'base' }} color="secondary">
                {section.body}
              </Text>
            </div>
          ))}
        </Stack>

        <div
          style={{
            paddingTop: '1rem',
            borderTop: '1px solid var(--azimuth-color-border)',
          }}
        >
          <Text
            element={{ size: 'xs' }}
            color="muted"
            style={{ fontStyle: 'italic' }}
          >
            These terms are a starting point and may need to be reviewed by a
            legal professional for your specific needs.
          </Text>
        </div>
      </Stack>
    </Container>
  )
}
