import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { MfaPanel } from '../mfa-panel'

vi.mock('../mfa', () => ({
  removeMfa: vi.fn(),
  sendReauthCode: vi.fn().mockResolvedValue({ success: true }),
}))

describe('MfaPanel', () => {
  const factors = [
    { id: '1', type: 'totp', created_at: '2025-01-15T00:00:00Z' },
  ]

  it('renders remove buttons for existing factors', () => {
    render(<MfaPanel factors={factors} stepUpMode="password" />)
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('shows existing factors when provided', () => {
    render(<MfaPanel factors={factors} stepUpMode="password" />)
    expect(screen.getByText(/TOTP/)).toBeInTheDocument()
  })

  it('shows empty state when no factors', () => {
    render(<MfaPanel factors={[]} stepUpMode="password" />)
    expect(screen.getByText('No 2FA methods configured.')).toBeInTheDocument()
  })

  it('renders enrollment options when not enrolling', () => {
    render(<MfaPanel factors={[]} stepUpMode="password" />)
    expect(
      screen.getByRole('button', { name: 'Set up Authenticator App' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Add Passkey/ }),
    ).toBeInTheDocument()
  })

  it('requires password step-up before removing a factor (admin mode)', () => {
    render(<MfaPanel factors={factors} stepUpMode="password" />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(screen.getByText("Confirm it's you")).toBeInTheDocument()
    expect(screen.getByText(/Re-enter your password/)).toBeInTheDocument()
  })

  it('requires step-up before starting enrollment (admin mode)', () => {
    render(<MfaPanel factors={[]} stepUpMode="password" />)
    fireEvent.click(
      screen.getByRole('button', { name: 'Set up Authenticator App' }),
    )
    expect(screen.getByText("Confirm it's you")).toBeInTheDocument()
  })

  it('gates 2FA management when step-up is unavailable (client mode)', () => {
    render(<MfaPanel factors={factors} stepUpMode="unavailable" />)
    expect(
      screen.getByText(/Two-factor setup for client accounts is coming soon/),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Set up Authenticator App' }),
    ).toBeNull()
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <MfaPanel factors={factors} stepUpMode="password" />,
    )
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })

  it('has no a11y violations when empty', async () => {
    const { container } = render(
      <MfaPanel factors={[]} stepUpMode="password" />,
    )
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
