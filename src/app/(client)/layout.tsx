'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Stack, Text, Button } from 'azimuth-ui'
import styles from './client-layout.module.css'

interface ClientUser {
  id: string
  role: string
}

const NAV_ITEMS = [
  { label: 'Home', path: '/dashboard', tabIcon: '🏠' },
  { label: 'Privacy', path: '/dashboard/privacy', tabIcon: '🔒' },
  { label: 'Billing', path: '/dashboard/billing', tabIcon: '💰' },
  { label: 'Support', path: 'mailto:support@novamir.dev', tabIcon: '📧' },
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
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <Stack spacing="sm" className={styles.sidebarInner}>
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Client Portal
          </Text>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path !== 'mailto:support@novamir.dev' &&
              pathname.startsWith(item.path)
            return item.path.startsWith('mailto:') ? (
              <a
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
        </Stack>
        <div className={styles.sidebarFooter}>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/">Back to Site</Link>
          </Button>
        </div>
      </nav>

      <main id="main-content" className={styles.main}>
        {children}
      </main>

      <nav className={styles.bottomBar}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path !== 'mailto:support@novamir.dev' &&
            pathname.startsWith(item.path)
          return item.path.startsWith('mailto:') ? (
            <a
              key={item.path}
              href={item.path}
              className={`${styles.bottomTab} ${isActive ? styles.bottomTabActive : ''}`}
            >
              <span className={styles.bottomTabIcon}>{item.tabIcon}</span>
              <span className={styles.bottomTabLabel}>{item.label}</span>
            </a>
          ) : (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.bottomTab} ${isActive ? styles.bottomTabActive : ''}`}
            >
              <span className={styles.bottomTabIcon}>{item.tabIcon}</span>
              <span className={styles.bottomTabLabel}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
