import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClientLoginForm } from '../components/client-login-form'

vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOtp: vi.fn(),
    },
  })),
}))

describe('ClientLoginForm', () => {
  it('renders email input', () => {
    render(<ClientLoginForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders submit button with magic link text', () => {
    render(<ClientLoginForm />)
    expect(
      screen.getByRole('button', { name: 'Send Magic Link' }),
    ).toBeInTheDocument()
  })

  it('renders helper text about magic link', () => {
    render(<ClientLoginForm />)
    expect(screen.getByText(/We'll send a magic link/i)).toBeInTheDocument()
  })
})
