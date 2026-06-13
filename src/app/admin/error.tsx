'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: 'var(--azimuth-spacing-lg)' }}>
      <h2>Something went wrong</h2>
      <p>An unexpected error occurred in the admin area.</p>
      <button
        onClick={() => reset()}
        style={{
          padding: 'var(--azimuth-spacing-sm) var(--azimuth-spacing-md)',
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </div>
  )
}
