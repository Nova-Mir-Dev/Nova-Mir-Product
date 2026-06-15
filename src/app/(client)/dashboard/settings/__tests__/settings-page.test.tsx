import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SettingsPage from '../page'

vi.mock('@/lib/supabase-server', () => ({
  createClient: () => ({
    auth: {
      getUser: () =>
        Promise.resolve({
          data: {
            user: {
              id: 'test-user',
              email: 'test@example.com',
              role: 'client',
            },
          },
          error: null,
        }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { name: 'Test User', email: 'test@example.com' },
              error: null,
            }),
        }),
      }),
    }),
  }),
}))

vi.mock('@/features/auth/mfa', () => ({
  listMfaFactors: () => Promise.resolve({ all: [] }),
}))

vi.mock('@/features/auth/mfa-panel', () => ({
  MfaPanel: ({ factors }: { factors: unknown[] }) => (
    <div data-testid="mfa-panel">MFA ({factors.length} factors)</div>
  ),
}))

describe('SettingsPage', () => {
  it('renders without crashing', async () => {
    const element = await SettingsPage()
    const { container } = render(element)
    expect(container).toBeDefined()
  })

  it('renders Settings heading', async () => {
    const element = await SettingsPage()
    render(element)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Profile section', async () => {
    const element = await SettingsPage()
    render(element)
    expect(screen.getAllByText('Profile').length).toBeGreaterThanOrEqual(1)
  })

  it('renders Notifications section', async () => {
    const element = await SettingsPage()
    render(element)
    expect(screen.getAllByText('Notifications').length).toBeGreaterThanOrEqual(
      1,
    )
  })

  it('renders MFA panel', async () => {
    const element = await SettingsPage()
    render(element)
    expect(screen.getByTestId('mfa-panel')).toBeInTheDocument()
  })
})
