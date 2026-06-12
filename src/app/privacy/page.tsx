import { Container, Text, Stack } from 'azimuth-ui'

const sections = [
  {
    title: 'Information We Collect',
    body: 'We collect information you provide when filling out our contact form: name, email, business name, phone number, and project details.',
  },
  {
    title: 'How We Use Your Information',
    body: 'We use your information to respond to inquiries, provide our services, improve our offerings, and send occasional project-related communications.',
  },
  {
    title: 'Data Storage',
    body: 'Your information is stored securely in our database. We use industry-standard security measures to protect your data.',
  },
  {
    title: 'Third-Party Services',
    body: 'We use Supabase for database hosting and Vercel for application hosting. These providers have their own privacy policies governing data handling.',
  },
  {
    title: 'Data Retention',
    body: 'We retain your information for as long as needed to provide services or as required by applicable law. You may request deletion at any time.',
  },
  {
    title: 'Your Rights',
    body: 'Depending on your jurisdiction, you may have rights to access, correct, or delete your personal data. Contact us at hello@novamir.dev to exercise these rights.',
  },
  {
    title: 'Cookies',
    body: 'This site uses essential cookies for functionality. No tracking cookies are used without consent.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this policy. Changes will be posted on this page.',
  },
  {
    title: 'Contact',
    body: 'For privacy questions: hello@novamir.dev',
  },
]

export default function PrivacyPage() {
  return (
    <Container
      style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="2xl">
        <div>
          <Text element={{ as: 'h1', size: 'h1' }} weight="bold">
            Privacy Policy
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
            This privacy policy is a starting point and may need to be reviewed
            by a legal professional for your specific needs.
          </Text>
        </div>
      </Stack>
    </Container>
  )
}
