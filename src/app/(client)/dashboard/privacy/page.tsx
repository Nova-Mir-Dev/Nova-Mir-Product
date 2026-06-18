'use client'

import { Container, Text, Stack } from 'azimuth-ui'
import { ComplianceRequestForm } from '@/features/compliance/compliance-request-form'

export default function PrivacyDashboardPage() {
  return (
    <Container maxWidth={640} style={{ padding: '2rem 1rem' }}>
      <Stack spacing="lg">
        <Text element={{ as: 'h1', size: 'h2' }} weight="bold">
          Privacy & Data
        </Text>
        <Text element={{ size: 'base' }} color="secondary">
          Manage your personal data and exercise your privacy rights.
        </Text>
        <ComplianceRequestForm />
      </Stack>
    </Container>
  )
}
