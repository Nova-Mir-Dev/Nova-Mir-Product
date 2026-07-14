import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdminSidebar } from '../components/admin-nav'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({ push }),
}))

beforeEach(() => {
  push.mockClear()
})

const routes = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Clients', href: '/admin/clients' },
  { label: 'Leads', href: '/admin/leads' },
  { label: 'Projects', href: '/admin/projects' },
  { label: 'Billing', href: '/admin/billing' },
  { label: 'Revenue', href: '/admin/revenue' },
  { label: 'Monitoring', href: '/admin/monitoring' },
  { label: 'Bootstrap', href: '/admin/bootstrap' },
  { label: 'Admins', href: '/admin/admins' },
  { label: 'Audit Log', href: '/admin/audit' },
  { label: 'DSAR', href: '/admin/compliance/dsar' },
]

describe('AdminSidebar routing', () => {
  it('navigates to the matching admin route when an item is selected', () => {
    render(<AdminSidebar />)
    for (const route of routes) {
      push.mockClear()
      fireEvent.click(screen.getByRole('button', { name: route.label }))
      expect(push).toHaveBeenCalledWith(route.href)
    }
  })

  it('exposes content sub-routes under the Content group', () => {
    render(<AdminSidebar />)
    fireEvent.click(screen.getByRole('button', { name: 'Content' }))
    for (const child of [
      { label: 'Portfolio', href: '/admin/content/portfolio' },
      { label: 'Hero Headlines', href: '/admin/content/hero-headlines' },
      { label: 'Pricing', href: '/admin/content/pricing' },
    ]) {
      push.mockClear()
      fireEvent.click(screen.getByRole('button', { name: child.label }))
      expect(push).toHaveBeenCalledWith(child.href)
    }
  })
})
