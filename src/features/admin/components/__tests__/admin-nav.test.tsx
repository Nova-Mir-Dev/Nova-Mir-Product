import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AdminNav from '../admin-nav'

describe('AdminNav', () => {
  const expectedItems = [
    { label: 'Clients', href: '/admin/clients' },
    { label: 'Projects', href: '/admin/projects' },
    { label: 'Billing', href: '/admin/billing' },
    { label: 'Monitoring', href: '/admin/monitoring' },
    { label: 'Bootstrap', href: '/admin/bootstrap' },
    { label: 'Audit Log', href: '/admin/audit' },
    { label: 'Settings', href: '/admin/settings' },
  ]

  it('renders the heading', () => {
    render(<AdminNav />)
    expect(screen.getAllByText('Admin').length).toBeGreaterThanOrEqual(1)
  })

  it('renders all nav items', () => {
    render(<AdminNav />)
    for (const item of expectedItems) {
      expect(screen.getAllByText(item.label).length).toBeGreaterThanOrEqual(1)
    }
  })

  it('renders links with correct hrefs', () => {
    render(<AdminNav />)
    for (const item of expectedItems) {
      const links = screen.getAllByRole('link')
      const itemLink = links.find((l) => l.getAttribute('href') === item.href)
      expect(itemLink).toBeDefined()
    }
  })

  it('renders the correct number of nav items', () => {
    render(<AdminNav />)
    const links = screen.getAllByRole('link')
    const navLinks = links.filter((l) =>
      expectedItems.some((item) => item.href === l.getAttribute('href')),
    )
    expect(navLinks.length).toBeGreaterThanOrEqual(expectedItems.length)
  })
})
