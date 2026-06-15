import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardPage from '../page'

vi.mock('@/lib/supabase-server', () => ({
  createClient: () => ({
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: { id: 'test-user', email: 'test@example.com' } },
          error: null,
        }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: {
                name: 'Test User',
                email: 'test@example.com',
                role: 'client',
              },
              error: null,
            }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  }),
}))

vi.mock('../billing/actions', () => ({
  openCustomerPortal: vi.fn(),
}))

describe('DashboardPage', () => {
  it('renders without crashing', async () => {
    const element = await DashboardPage()
    const { container } = render(element)
    expect(container).toBeDefined()
  })

  it('renders dashboard heading', async () => {
    const element = await DashboardPage()
    render(element)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Active Projects stat', async () => {
    const element = await DashboardPage()
    render(element)
    expect(
      screen.getAllByText(/active projects/i).length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('renders Quick Actions', async () => {
    const element = await DashboardPage()
    render(element)
    expect(screen.getAllByText(/quick actions/i).length).toBeGreaterThanOrEqual(
      1,
    )
  })

  it('renders Recent Activity', async () => {
    const element = await DashboardPage()
    render(element)
    expect(
      screen.getAllByText(/recent activity/i).length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('shows welcome with user name', async () => {
    const element = await DashboardPage()
    render(element)
    expect(screen.getAllByText(/test user/i).length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state for no active projects', async () => {
    const element = await DashboardPage()
    render(element)
    expect(
      screen.getAllByText(/no active projects yet/i).length,
    ).toBeGreaterThanOrEqual(1)
  })
})
