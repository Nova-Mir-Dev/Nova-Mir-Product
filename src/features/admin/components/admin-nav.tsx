'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Stack, Text } from 'azimuth-ui'
import { UserMenu } from './user-menu'
import styles from './admin-nav.module.css'

interface NavItem {
  label: string
  path: string
  items?: NavItem[]
}

interface AdminUser {
  name: string | null
  email: string | null
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
  { label: 'DSAR', path: '/admin/compliance/dsar' },
  { label: 'Settings', path: '/admin/settings' },
  {
    label: 'Content',
    path: '/admin/content',
        items: [
          { label: 'Portfolio', path: '/admin/content/portfolio' },
          { label: 'Hero Headlines', path: '/admin/content/hero-headlines' },
          { label: 'Pricing', path: '/admin/content/pricing' },
        ],
  },
]

export default function AdminNav({ user }: { user?: AdminUser | null }) {
  const pathname = usePathname()

  return (
    <nav className={styles.nav} aria-label="Admin navigation">
      <div className={styles.navInner}>
        <Stack spacing="sm">
          <Link href="/" className={styles.brand}>
            <img src="/logo-icon.svg" alt="" className={styles.logo} />
            <Text
              element={{ as: 'h2', size: 'h5' }}
              weight="semibold"
              className={styles.title}
            >
              Nova Mir | Admin
            </Text>
          </Link>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.path} className={styles.navItem}>
                {item.items ? (
                  <>
                    <Text className={styles.navSectionLabel}>{item.label}</Text>
                    <ul className={styles.navSublist}>
                      {item.items.map((sub) => (
                        <li key={sub.path} className={styles.navSubItem}>
                          <Link
                            href={sub.path}
                            className={styles.link}
                            aria-current={
                              pathname === sub.path ? 'page' : undefined
                            }
                          >
                            <Text>{sub.label}</Text>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    href={item.path}
                    className={styles.link}
                    aria-current={pathname === item.path ? 'page' : undefined}
                  >
                    <Text>{item.label}</Text>
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <Link href="/" className={styles.link}>
            <Text>← Back to Site</Text>
          </Link>
          {user && <UserMenu name={user.name} email={user.email} />}
        </Stack>
      </div>
    </nav>
  )
}
