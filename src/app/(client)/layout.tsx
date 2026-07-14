'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Stack,
  Text,
  Button,
  HomeIcon,
  CreditCardIcon,
  IdCardIcon,
  EnvelopeIcon,
  UserLargeIcon,
} from 'azimuth-ui'
import styles from './client-layout.module.css'

interface ClientUser {
  id: string
  role: string
}

const NAV_ITEMS = [
  { label: 'Home', path: '/dashboard', icon: 'home' },
  { label: 'Privacy', path: '/dashboard/privacy', icon: 'privacy' },
  { label: 'Billing', path: '/dashboard/billing', icon: 'billing' },
  { label: 'Support', path: '/dashboard/support', icon: 'support' },
  { label: 'Settings', path: '/dashboard/settings', icon: 'settings' },
]

const NAV_ICONS: Record<string, React.ReactNode> = {
  home: <HomeIcon />,
  privacy: <IdCardIcon />,
  billing: <CreditCardIcon />,
  support: <EnvelopeIcon />,
  settings: <UserLargeIcon />,
}

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
          <Link href="/" className={styles.brand}>
            <img src="/logo-icon.svg" alt="" className={styles.logo} />
            <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
              Nova Mir
            </Text>
          </Link>
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.path || pathname.startsWith(item.path + '/')
            return (
              <Link
                key={item.path}
                href={item.path}
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
            pathname === item.path || pathname.startsWith(item.path + '/')
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.bottomTab} ${isActive ? styles.bottomTabActive : ''}`}
            >
              <span className={styles.bottomTabIcon}>
                {NAV_ICONS[item.icon]}
              </span>
              <span className={styles.bottomTabLabel}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
