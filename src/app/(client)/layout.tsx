'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
import { LocaleSwitcher } from '@/features/i18n/locale-switcher'
import styles from './client-layout.module.css'

interface ClientUser {
  id: string
  role: string
}

const NAV_ITEMS = [
  { key: 'home', path: '/dashboard', icon: 'home' },
  { key: 'privacy', path: '/dashboard/privacy', icon: 'privacy' },
  { key: 'billing', path: '/dashboard/billing', icon: 'billing' },
  { key: 'support', path: '/dashboard/support', icon: 'support' },
  { key: 'settings', path: '/dashboard/settings', icon: 'settings' },
] as const

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
  const t = useTranslations('Dashboard')
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

  if (loading) return <Text>{t('loading')}</Text>
  if (!user) return null

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <Stack spacing="sm" className={styles.sidebarInner}>
          <Link href="/" className={styles.brand}>
            <img src="/logo-icon.svg" alt="" className={styles.logo} />
            <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
              {t('brand')}
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
                {t(`nav.${item.key}`)}
              </Link>
            )
          })}
        </Stack>
        <div className={styles.sidebarFooter}>
          <LocaleSwitcher />
          <Button variant="secondary" size="sm" asChild>
            <Link href="/">{t('backToSite')}</Link>
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
              <span className={styles.bottomTabLabel}>
                {t(`nav.${item.key}`)}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
