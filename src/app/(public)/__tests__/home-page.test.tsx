import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from '../page'

describe('HomePage', () => {
  it('renders without crashing', () => {
    const { container } = render(<HomePage />)
    expect(container).toBeDefined()
  })

  it('renders a heading', () => {
    render(<HomePage />)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Services section', () => {
    render(<HomePage />)
    expect(screen.getAllByText('Services').length).toBeGreaterThanOrEqual(1)
  })

  it('renders How It Works section', () => {
    render(<HomePage />)
    expect(screen.getAllByText('How It Works').length).toBeGreaterThanOrEqual(1)
  })

  it('renders Pricing section', () => {
    render(<HomePage />)
    expect(screen.getAllByText('Pricing').length).toBeGreaterThanOrEqual(1)
  })

  it('renders CTA section', () => {
    render(<HomePage />)
    expect(
      screen.getAllByText('Think this could be a fit?').length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('renders Get Started button', () => {
    render(<HomePage />)
    const buttons = screen.getAllByText('Get Started')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })
})
