'use client'

import { useEffect } from 'react'

export default function BillingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Billing error:', error)
  }, [error])

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '50vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: 8,
            color: 'var(--azimuth-color-text)',
          }}
        >
          Could not load billing
        </h2>
        <p
          style={{
            color: 'var(--azimuth-color-text-secondary)',
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          Something went wrong loading your invoices. Try again or contact support.
        </p>
        <button
          onClick={reset}
          style={{
            padding: '10px 24px',
            borderRadius: 6,
            border: 'none',
            background: 'var(--azimuth-color-primary)',
            color: 'var(--azimuth-color-on-primary)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
