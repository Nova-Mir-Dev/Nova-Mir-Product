import { Container, Text, Stack } from 'azimuth-ui'

export default function Loading() {
  return (
    <Container
      maxWidth={640}
      style={{ margin: '4rem auto', padding: '0 1rem' }}
    >
      <Stack spacing="md">
        <Text element={{ size: 'lg' }} color="secondary" align="center">
          Loading...
        </Text>
      </Stack>
    </Container>
  )
}
