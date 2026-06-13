import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { MfaPanel } from '../mfa-panel'

describe('MfaPanel', () => {
  const factors = [
    { id: '1', type: 'totp', created_at: '2025-01-15T00:00:00Z' },
  ]

  it('renders heading', () => {
    render(<MfaPanel factors={factors} />)
    expect(
      screen.getByRole('heading', { name: 'Two-Factor Authentication' }),
    ).toBeInTheDocument()
  })

  it('shows existing factors when provided', () => {
    render(<MfaPanel factors={factors} />)
    expect(screen.getByText(/TOTP/)).toBeInTheDocument()
  })

  it('shows empty state when no factors', () => {
    render(<MfaPanel factors={[]} />)
    expect(
      screen.getByText('No 2FA methods configured.'),
    ).toBeInTheDocument()
  })

  it('renders Enable 2FA button when not enrolling', () => {
    render(<MfaPanel factors={[]} />)
    expect(
      screen.getByRole('button', { name: 'Enable 2FA' }),
    ).toBeInTheDocument()
  })

  it('has no a11y violations', async () => {
    const { container } = render(<MfaPanel factors={factors} />)
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })

  it('has no a11y violations when empty', async () => {
    const { container } = render(<MfaPanel factors={[]} />)
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
