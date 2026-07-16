import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdminSidebar } from '../admin-nav'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({ push }),
}))

beforeEach(() => {
  push.mockClear()
})

describe('AdminSidebar', () => {
  const topLevelItems = [
    'Dashboard',
    'Clients',
    'Leads',
    'Projects',
    'Documents',
    'Billing',
    'Revenue',
    'Monitoring',
    'Bootstrap',
    'Admins',
    'Audit Log',
    'DSAR',
    'Content',
  ]

  it('renders the brand heading', () => {
    render(<AdminSidebar />)
    expect(
      screen.getByRole('heading', { name: 'Nova Mir | Admin' }),
    ).toBeInTheDocument()
  })

  it('renders all top-level nav items', () => {
    render(<AdminSidebar />)
    for (const label of topLevelItems) {
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1)
    }
  })

  it('renders a navigation landmark', () => {
    render(<AdminSidebar />)
    expect(screen.getAllByRole('navigation').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the back-to-site footer link', () => {
    render(<AdminSidebar />)
    const links = screen.getAllByRole('link')
    const backLink = links.find((l) => l.textContent?.includes('Back to Site'))
    expect(backLink).toBeDefined()
    expect(backLink!.getAttribute('href')).toBe('/')
  })
})
