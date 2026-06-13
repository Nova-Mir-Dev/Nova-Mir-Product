import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminNav from '../../admin/components/admin-nav'

const navItems = [
  { label: 'Clients', href: '/admin/clients' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'Billing', href: '/admin/billing' },
  { label: 'Monitoring', href: '/admin/monitoring' },
  { label: 'Bootstrap', href: '/admin/bootstrap' },
  { label: 'Audit Log', href: '/admin/audit' },
  { label: 'Settings', href: '/admin/settings' },
]

describe('AdminNav renders all routes', () => {
  it('renders Admin heading', () => {
    render(<AdminNav />)
    const headings = screen.getAllByText('Admin')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders all nav items', () => {
    render(<AdminNav />)
    for (const item of navItems) {
      const matches = screen.getAllByText(item.label)
      expect(matches.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('links point to correct admin routes', () => {
    render(<AdminNav />)
    const links = screen.getAllByRole('link')
    for (const item of navItems) {
      const matchingLink = links.find(
        (l) => l.getAttribute('href') === item.href,
      )
      expect(matchingLink).toBeDefined()
    }
  })

  it('renders nav as a navigation landmark', () => {
    render(<AdminNav />)
    const navs = screen.getAllByRole('navigation')
    expect(navs.length).toBeGreaterThanOrEqual(1)
  })

  it('renders each nav item as a listitem', () => {
    render(<AdminNav />)
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBeGreaterThanOrEqual(navItems.length)
  })

  it('renders correct number of navigation links', () => {
    render(<AdminNav />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(navItems.length)
  })

  it('renders nav heading with accessible role', () => {
    render(<AdminNav />)
    const headings = screen.getAllByRole('heading', { name: 'Admin' })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })
})
