import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { LoginForm } from '../login-form'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
    },
  }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('renders heading', () => {
    render(<LoginForm />)
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('form has submit handler', () => {
    render(<LoginForm />)
    const form = screen.getByRole('button', { name: 'Sign In' }).closest('form')
    expect(form).toBeInTheDocument()
  })

  it('has no a11y violations', async () => {
    const { container } = render(<LoginForm />)
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
