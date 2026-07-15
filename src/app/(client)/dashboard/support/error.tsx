'use client'

import { Button, Container, Stack, Text } from 'azimuth-ui'

export default function SupportError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Container maxWidth={720} style={{ padding: '2rem 1rem' }}>
      <Stack spacing="md">
        <Text element={{ as: 'h2', size: 'h4' }} weight="semibold">
          Support unavailable
        </Text>
        <Text color="secondary" role="alert">
          We could not load the support page. Please try again.
        </Text>
        <Button variant="primary" onClick={reset}>
          Try Again
        </Button>
      </Stack>
    </Container>
  )
}
