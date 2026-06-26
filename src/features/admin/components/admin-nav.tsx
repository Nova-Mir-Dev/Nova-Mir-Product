'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Text } from 'azimuth-ui'
import styles from './admin-nav.module.css'

interface NavItem {
  label: string
  path: string
  items?: NavItem[]
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

export default function AdminNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <button
        className={styles.menuButton}
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {mobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        className={`${styles.nav} ${mobileOpen ? styles.navOpen : ''}`}
        aria-label="Admin navigation"
      >
        <div className={styles.navInner}>
          <div className={styles.navHeader}>
            <Link href="/" className={styles.brand}>
              <img src="/logo-icon.svg" alt="" className={styles.logo} />
              <Text
                element={{ as: 'h2', size: 'h5' }}
                weight="semibold"
              >
                Nova Mir | Admin
              </Text>
            </Link>
            <button
              className={styles.closeButton}
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
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
          <div className={styles.backToSite}>
            <Link href="/" className={styles.link}>
              <Text>← Back to Site</Text>
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}
