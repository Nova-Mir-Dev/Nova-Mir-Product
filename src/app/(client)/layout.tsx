'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button, Stack, Text } from 'azimuth-ui'

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

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<ClientUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.role !== 'client') {
          router.push('/login')
          return
        }
        setUser(data as ClientUser)
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <Text>Loading...</Text>
  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 240, borderRight: '1px solid var(--azimuth-color-border)' }}>
        <Stack spacing="sm" style={{ padding: 'var(--azimuth-spacing-md)' }}>
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Dashboard
          </Text>
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.path}
              variant={pathname === item.path ? 'primary' : 'tertiary'}
              onClick={() => router.push(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </nav>
      <main id="main-content" style={{ flex: 1, padding: 'var(--azimuth-spacing-lg)' }}>
        {children}
      </main>
    </div>
  )
}
