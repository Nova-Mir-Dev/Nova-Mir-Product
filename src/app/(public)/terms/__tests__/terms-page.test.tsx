import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TermsPage from '../page'

describe('TermsPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<TermsPage />)
    expect(container).toBeDefined()
  })

  it('renders a heading', () => {
    render(<TermsPage />)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Terms of Service title', () => {
    render(<TermsPage />)
    expect(
      screen.getAllByText('Terms of Service').length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('renders services section', () => {
    render(<TermsPage />)
    expect(screen.getAllByText(/Services/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders last updated date', () => {
    render(<TermsPage />)
    expect(screen.getAllByText(/last updated/i).length).toBeGreaterThanOrEqual(
      1,
    )
  })
})
