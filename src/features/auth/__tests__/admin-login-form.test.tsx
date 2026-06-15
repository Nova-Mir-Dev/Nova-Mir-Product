import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdminLoginForm } from '../components/admin-login-form'

vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
    },
  })),
}))

describe('AdminLoginForm', () => {
  it('renders email input', () => {
    render(<AdminLoginForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders password input', () => {
    render(<AdminLoginForm />)
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<AdminLoginForm />)
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })
})
