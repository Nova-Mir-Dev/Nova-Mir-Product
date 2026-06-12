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
      style={{ maxWidth: 640, margin: '4rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="md" style={{ textAlign: 'center' }}>
        <Text element={{ as: 'h1', size: 'h2' }} weight="bold">
          Something went wrong
        </Text>
        <Text element={{ size: 'base' }} color="secondary">
          An unexpected error occurred. Please try again.
        </Text>
        <Button variant="primary" onClick={reset}>
          Try Again
        </Button>
      </Stack>
    </Container>
  )
}
