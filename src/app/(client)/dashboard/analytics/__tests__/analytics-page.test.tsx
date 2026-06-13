import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import AnalyticsPage from '../page'

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
})

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
            data: { name: 'Test User' },
            error: null,
          }),
        }),
      }),
      order: () => Promise.resolve({ data: [], error: null }),
    }),
  }),
}))

describe('AnalyticsPage', () => {
  it('renders without crashing', async () => {
    const element = await AnalyticsPage()
    const { container } = render(element)
    expect(container).toBeDefined()
  })

  it('renders Analytics heading', async () => {
    const element = await AnalyticsPage()
    render(element)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders stat cards', async () => {
    const element = await AnalyticsPage()
    render(element)
    expect(screen.getAllByText(/total projects/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/total spent/i).length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state when no data', async () => {
    const element = await AnalyticsPage()
    render(element)
    expect(screen.getAllByText(/no data to show yet/i).length).toBeGreaterThanOrEqual(1)
  })
})
