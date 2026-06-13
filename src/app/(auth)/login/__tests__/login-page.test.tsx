import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginPage from '../page'

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signInWithOtp: vi.fn(),
    },
  }),
}))

describe('LoginPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoginPage />)
    expect(container).toBeDefined()
  })

  it('renders Sign In heading', () => {
    render(<LoginPage />)
    expect(screen.getAllByText('Sign In').length).toBeGreaterThanOrEqual(1)
  })

  it('renders Admin tab button', () => {
    render(<LoginPage />)
    const adminBtn = screen.getAllByText('Admin')
    expect(adminBtn.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Client tab button', () => {
    render(<LoginPage />)
    const clientBtn = screen.getAllByText('Client')
    expect(clientBtn.length).toBeGreaterThanOrEqual(1)
  })

  it('renders email input by default', () => {
    render(<LoginPage />)
    expect(screen.getAllByText('Email').length).toBeGreaterThanOrEqual(1)
  })
})
