'use client'

import { useCallback, useEffect, useState } from 'react'
import { hasCookieConsent, hasDeclinedConsent, setCookieConsent } from '@/lib/cookie-consent'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!hasCookieConsent() && !hasDeclinedConsent()) {
      setVisible(true)
    }
  }, [])

  const accept = useCallback(() => {
    setCookieConsent(true)
    setVisible(false)
    loadPlausible()
  }, [])

  const decline = useCallback(() => {
    setCookieConsent(false)
    setVisible(false)
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '1rem 1.5rem',
        background: 'var(--azimuth-color-surface, #1a1a2e)',
        borderTop: '1px solid var(--azimuth-color-border, #333)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '0.875rem',
          color: 'var(--azimuth-color-text, #e0e0e0)',
          maxWidth: '480px',
        }}
      >
        This site uses essential cookies for functionality. We&rsquo;d like to
        use Plausible Analytics to understand how visitors use our site. No
        personal data is collected.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={decline}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            borderRadius: 'var(--azimuth-radius, 6px)',
            border: '1px solid var(--azimuth-color-border, #333)',
            background: 'transparent',
            color: 'var(--azimuth-color-text, #e0e0e0)',
            cursor: 'pointer',
          }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            borderRadius: 'var(--azimuth-radius, 6px)',
            border: 'none',
            background: 'var(--azimuth-color-primary, #6366f1)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Accept Analytics
        </button>
      </div>
    </div>
  )
}

function loadPlausible() {
  const existing = document.querySelector('script[data-domain="novamir.dev"]')
  if (existing) return
  const script = document.createElement('script')
  script.defer = true
  script.dataset.domain = 'novamir.dev'
  script.src = 'https://plausible.io/js/script.js'
  document.head.appendChild(script)
}
