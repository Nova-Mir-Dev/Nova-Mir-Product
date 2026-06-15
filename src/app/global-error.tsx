'use client'

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center', padding: '0 1rem' }}>
            <h1 style={{ fontSize: 24, marginBottom: 8 }}>
              Something went wrong
            </h1>
            <p
              style={{
                color: '#666',
                marginBottom: 24,
                maxWidth: 400,
                lineHeight: 1.5,
              }}
            >
              A critical error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '10px 28px',
                borderRadius: 6,
                border: 'none',
                background: '#000',
                color: '#fff',
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
