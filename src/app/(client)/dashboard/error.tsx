'use client'

import { Container, Text, Button, Stack } from 'azimuth-ui'

export default function Error({
  reset,
  error: _error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Container
      maxWidth={640}
      style={{ margin: '4rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="md">
        <Text element={{ as: 'h1', size: 'h2' }} weight="bold" align="center">
          Something went wrong
        </Text>
        <Text
          element={{ size: 'base' }}
          color="secondary"
          align="center"
          role="alert"
        >
          An unexpected error occurred in the dashboard. Please try again.
        </Text>
        <div style={{ textAlign: 'center' }}>
          <Button variant="primary" onClick={reset}>
            Try Again
          </Button>
        </div>
      </Stack>
    </Container>
  )
}
