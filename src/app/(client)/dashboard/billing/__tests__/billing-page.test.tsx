import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import BillingPage from '../page'

vi.mock('@/lib/supabase-server', () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({
        data: { user: { id: 'test-user', email: 'test@example.com' } },
        error: null,
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { name: 'Test User', email: 'test@example.com' },
            error: null,
          }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
      order: () => Promise.resolve({ data: [], error: null }),
    }),
  }),
}))

vi.mock('../actions', () => ({
  openCustomerPortal: vi.fn(),
}))

describe('BillingPage', () => {
  it('renders without crashing', async () => {
    const element = await BillingPage()
    const { container } = render(element)
    expect(container).toBeDefined()
  })

  it('renders Billing heading', async () => {
    const element = await BillingPage()
    render(element)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Current Plan section', async () => {
    const element = await BillingPage()
    render(element)
    expect(screen.getAllByText(/current plan/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders Invoice History section', async () => {
    const element = await BillingPage()
    render(element)
    expect(screen.getAllByText(/invoice history/i).length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state when no invoices', async () => {
    const element = await BillingPage()
    render(element)
    expect(screen.getAllByText(/no invoices yet/i).length).toBeGreaterThanOrEqual(1)
  })
})
