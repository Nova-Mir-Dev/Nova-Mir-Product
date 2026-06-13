import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PortfolioPage from '../page'

describe('PortfolioPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<PortfolioPage />)
    expect(container).toBeDefined()
  })

  it('renders a heading', () => {
    render(<PortfolioPage />)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Portfolio title', () => {
    render(<PortfolioPage />)
    expect(screen.getAllByText('Portfolio').length).toBeGreaterThanOrEqual(1)
  })

  it('renders Start Your Project button', () => {
    render(<PortfolioPage />)
    const buttons = screen.getAllByText('Start Your Project')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders project descriptions', () => {
    render(<PortfolioPage />)
    expect(screen.getAllByText(/dev/i).length).toBeGreaterThanOrEqual(1)
  })
})
