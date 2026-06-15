'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Stack, Text } from 'azimuth-ui'
import styles from './admin-nav.module.css'

interface NavItem {
  label: string
  path: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Clients', path: '/admin/clients' },
  { label: 'Leads', path: '/admin/leads' },
  { label: 'Projects', path: '/admin/projects' },
  { label: 'Billing', path: '/admin/billing' },
  { label: 'Revenue', path: '/admin/revenue' },
  { label: 'Monitoring', path: '/admin/monitoring' },
  { label: 'Bootstrap', path: '/admin/bootstrap' },
  { label: 'Admins', path: '/admin/admins' },
  { label: 'Audit Log', path: '/admin/audit' },
  { label: 'Settings', path: '/admin/settings' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className={styles.nav} aria-label="Admin navigation">
      <div className={styles.navInner}>
        <Stack spacing="sm">
          <Text
            element={{ as: 'h2', size: 'h5' }}
            weight="semibold"
            className={styles.title}
          >
            Admin
          </Text>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.path} className={styles.navItem}>
                <Link
                  href={item.path}
                  className={styles.link}
                  aria-current={pathname === item.path ? 'page' : undefined}
                >
                  <Text>{item.label}</Text>
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.backToSite}>
            <Link href="/" className={styles.link}>
              <Text>← Back to Site</Text>
            </Link>
          </div>
        </Stack>
      </div>
    </nav>
  )
}
