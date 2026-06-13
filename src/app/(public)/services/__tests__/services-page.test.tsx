import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ServicesPage from '../page'

describe('ServicesPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<ServicesPage />)
    expect(container).toBeDefined()
  })

  it('renders a heading', () => {
    render(<ServicesPage />)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Services & Pricing title', () => {
    render(<ServicesPage />)
    expect(screen.getAllByText(/services.*pricing/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders Get Started buttons', () => {
    render(<ServicesPage />)
    const buttons = screen.getAllByText('Get Started')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders includes section', () => {
    render(<ServicesPage />)
    expect(screen.getAllByText(/includes/i).length).toBeGreaterThanOrEqual(1)
  })
})
