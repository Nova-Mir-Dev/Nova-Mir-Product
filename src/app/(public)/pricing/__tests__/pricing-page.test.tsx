import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PricingPage from '../page'

describe('PricingPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<PricingPage />)
    expect(container).toBeDefined()
  })

  it('renders a heading', () => {
    render(<PricingPage />)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Pricing title', () => {
    render(<PricingPage />)
    expect(screen.getAllByText('Pricing').length).toBeGreaterThanOrEqual(1)
  })

  it('renders transparent pricing text', () => {
    render(<PricingPage />)
    expect(
      screen.getAllByText(/transparent pricing/i).length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('renders Launch Client Program section', () => {
    render(<PricingPage />)
    expect(
      screen.getAllByText(/Founding Client Program/i).length,
    ).toBeGreaterThanOrEqual(1)
  })
})
