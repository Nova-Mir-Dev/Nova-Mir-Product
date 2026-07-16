'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sidebar, Text } from 'azimuth-ui'
import type { SidebarItem } from 'azimuth-ui'
import styles from './admin-nav.module.css'

const navItems: SidebarItem[] = [
  { key: '/admin', label: 'Dashboard' },
  { key: '/admin/clients', label: 'Clients' },
  { key: '/admin/leads', label: 'Leads' },
  { key: '/admin/projects', label: 'Projects' },
  { key: '/admin/documents', label: 'Documents' },
  { key: '/admin/billing', label: 'Billing' },
  { key: '/admin/revenue', label: 'Revenue' },
  { key: '/admin/monitoring', label: 'Monitoring' },
  { key: '/admin/bootstrap', label: 'Bootstrap' },
  { key: '/admin/admins', label: 'Admins' },
  { key: '/admin/audit', label: 'Audit Log' },
  { key: '/admin/compliance/dsar', label: 'DSAR' },
  {
    key: 'content',
    label: 'Content',
    children: [
      { key: '/admin/content/portfolio', label: 'Portfolio' },
      { key: '/admin/content/hero-headlines', label: 'Hero Headlines' },
      { key: '/admin/content/pricing', label: 'Pricing' },
    ],
  },
]

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Sidebar
      items={navItems}
      activeKey={pathname}
      onSelect={(key) => router.push(key)}
      collapsed={collapsed}
      onToggle={() => setCollapsed(!collapsed)}
      header={
        <Link href="/" className={styles.brand}>
          <img src="/logo-icon.svg" alt="" className={styles.logo} />
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Nova Mir | Admin
          </Text>
        </Link>
      }
      footer={
        <Link href="/" className={styles.footerLink}>
          <Text>← Back to Site</Text>
        </Link>
      }
    />
  )
}
