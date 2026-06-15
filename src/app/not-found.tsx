import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center', padding: '0 1rem' }}>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            margin: 0,
            color: 'var(--azimuth-color-primary)',
          }}
        >
          404
        </h1>
        <h2 style={{ fontSize: 24, margin: '8px 0 16px' }}>Page not found</h2>
        <p
          style={{
            color: 'var(--azimuth-color-muted)',
            marginBottom: 24,
            maxWidth: 400,
          }}
        >
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '10px 28px',
            borderRadius: 6,
            border: 'none',
            background: 'var(--azimuth-color-primary)',
            color: '#fff',
            fontSize: 16,
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
