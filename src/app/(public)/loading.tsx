import { Container, Text, Stack } from 'azimuth-ui'

export default function Loading() {
  return (
    <Container
      style={{ maxWidth: 640, margin: '4rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="md" style={{ textAlign: 'center' }}>
        <Text element={{ size: 'lg' }} color="secondary">
          Loading...
        </Text>
      </Stack>
    </Container>
  )
}
