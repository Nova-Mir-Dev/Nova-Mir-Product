'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Stack, Text } from 'azimuth-ui'

interface ClientUser {
  id: string
  role: string
}

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Projects', path: '/dashboard/projects' },
  { label: 'Status', path: '/dashboard/status' },
  { label: 'Billing', path: '/dashboard/billing' },
  { label: 'Documents', path: '/dashboard/documents' },
  { label: 'Analytics', path: '/dashboard/analytics' },
  { label: 'Contact', path: '/dashboard/contact' },
  { label: 'Settings', path: '/dashboard/settings' },
]

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<ClientUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.role !== 'client') {
          window.location.href = '/clients/auth/login'
          return
        }
        setUser(data as ClientUser)
      })
      .catch(() => {
        window.location.href = '/clients/auth/login'
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Text>Loading...</Text>
  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav
        style={{
          width: 240,
          borderRight: '1px solid var(--azimuth-color-border)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack
          spacing="sm"
          style={{
            padding: 'var(--azimuth-spacing-md)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Dashboard
          </Text>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 16px',
                  borderRadius: 'var(--azimuth-radius-md, 8px)',
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: 1.5,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: isActive
                    ? 'var(--azimuth-color-primary, #4338ca)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--azimuth-color-white, #fff)'
                    : 'var(--azimuth-color-text, #1a1a2e)',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </Stack>
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 'var(--azimuth-spacing-md)',
            borderTop: '1px solid var(--azimuth-color-border)',
          }}
        >
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Text>← Back to Site</Text>
          </Link>
        </div>
      </nav>
      <main
        id="main-content"
        style={{ flex: 1, padding: 'var(--azimuth-spacing-lg)' }}
      >
        {children}
      </main>
    </div>
  )
}
