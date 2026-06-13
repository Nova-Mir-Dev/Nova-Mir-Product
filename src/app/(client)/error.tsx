'use client'

export default function ClientError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ color: 'var(--azimuth-color-muted)', marginBottom: 16, maxWidth: 400 }}>
          An unexpected error occurred in the client portal.
        </p>
        <button
          onClick={reset}
          style={{
            padding: '8px 24px',
            borderRadius: 6,
            border: 'none',
            background: 'var(--azimuth-color-primary)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
