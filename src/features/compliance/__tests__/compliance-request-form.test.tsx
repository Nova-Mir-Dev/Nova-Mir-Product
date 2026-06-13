import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { ComplianceRequestForm } from '../compliance-request-form'

describe('ComplianceRequestForm', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({}),
      ok: true,
    } as Response)
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true)
    globalThis.URL.createObjectURL = vi.fn(() => 'blob://test')
    globalThis.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders heading', () => {
    render(<ComplianceRequestForm />)
    expect(screen.getByText('Privacy Rights Request')).toBeInTheDocument()
  })

  it('renders download button', () => {
    render(<ComplianceRequestForm />)
    expect(
      screen.getByRole('button', { name: 'Download My Data' }),
    ).toBeInTheDocument()
  })

  it('renders delete button', () => {
    render(<ComplianceRequestForm />)
    expect(
      screen.getByRole('button', { name: 'Delete My Data' }),
    ).toBeInTheDocument()
  })

  it('shows success state after submission', async () => {
    render(<ComplianceRequestForm />)

    fireEvent.click(screen.getByRole('button', { name: 'Download My Data' }))

    const submitted = await screen.findByText('Request Submitted')
    expect(submitted).toBeInTheDocument()
  })

  it('has no a11y violations', async () => {
    const { container } = render(<ComplianceRequestForm />)
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
