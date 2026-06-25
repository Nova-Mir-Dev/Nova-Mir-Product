import { Container, Stack } from 'azimuth-ui'

export default function ProjectDetailLoading() {
  return (
    <Container maxWidth={960} style={{ padding: '2rem 1rem' }}>
      <Stack spacing="md">
        <div
          style={{
            height: 28,
            width: '40%',
            background: 'var(--azimuth-color-bg-secondary)',
            borderRadius: 4,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 16,
            width: '60%',
            background: 'var(--azimuth-color-bg-secondary)',
            borderRadius: 4,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 200,
            background: 'var(--azimuth-color-bg-secondary)',
            borderRadius: 8,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 16,
            width: '80%',
            background: 'var(--azimuth-color-bg-secondary)',
            borderRadius: 4,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 16,
            width: '70%',
            background: 'var(--azimuth-color-bg-secondary)',
            borderRadius: 4,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </Stack>
    </Container>
  )
}
