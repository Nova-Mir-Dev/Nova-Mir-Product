import { Container, Stack } from 'azimuth-ui'

export default function StatusLoading() {
  return (
    <Container maxWidth={720} style={{ padding: '2rem 1rem' }}>
      <Stack spacing="md">
        <div
          style={{
            height: 28,
            width: '25%',
            background: 'var(--azimuth-color-bg-secondary)',
            borderRadius: 4,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 16,
            width: '50%',
            background: 'var(--azimuth-color-bg-secondary)',
            borderRadius: 4,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 80,
            width: '90%',
            background: 'var(--azimuth-color-bg-secondary)',
            borderRadius: 8,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 80,
            width: '90%',
            background: 'var(--azimuth-color-bg-secondary)',
            borderRadius: 8,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </Stack>
    </Container>
  )
}
