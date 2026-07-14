import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { SettingsPage } from '../settings-page'

vi.mock('../actions', () => ({
  updateProfile: vi.fn(),
  updatePassword: vi.fn(),
  updateNotificationPrefs: vi.fn(),
  updateClientProfile: vi.fn(),
  createApiKey: vi.fn(),
  revokeApiKey: vi.fn(),
}))

describe('SettingsPage', () => {
  const defaultUser = { email: 'admin@example.com', name: 'Admin User' }

  it('renders heading', () => {
    const { getByText } = render(<SettingsPage user={defaultUser} />)
    expect(getByText('Settings')).toBeDefined()
  })

  it('shows profile tab by default', () => {
    const { getAllByText, container } = render(
      <SettingsPage user={defaultUser} />,
    )
    expect(getAllByText('Profile').length).toBeGreaterThan(0)
    expect(container.querySelector('input[name="name"]')).toBeDefined()
    expect(container.querySelector('input[name="email"]')).toBeDefined()
  })

  it('shows the API Keys tab button', () => {
    const { getAllByText } = render(<SettingsPage user={defaultUser} />)
    expect(getAllByText('API Keys').length).toBeGreaterThan(0)
  })

  it('renders with null name', () => {
    const { container } = render(
      <SettingsPage user={{ email: 'test@test.com', name: null }} />,
    )
    expect(container.querySelector('input[name="name"]')).toBeDefined()
  })
})
