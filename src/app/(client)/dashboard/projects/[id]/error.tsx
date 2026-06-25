'use client'

import { Button, Container, Stack, Text } from 'azimuth-ui'

export default function ProjectDetailError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Container maxWidth={960} style={{ padding: '2rem 1rem' }}>
      <Stack spacing="md">
        <Text element={{ as: 'h2', size: 'h4' }} weight="semibold">
          Project unavailable
        </Text>
        <Text color="secondary">
          We could not load this project. Please try again.
        </Text>
        <Button variant="primary" onClick={reset}>
          Try Again
        </Button>
      </Stack>
    </Container>
  )
}
