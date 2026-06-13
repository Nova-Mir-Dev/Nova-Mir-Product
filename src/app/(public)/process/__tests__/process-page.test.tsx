import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProcessPage from '../page'

describe('ProcessPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProcessPage />)
    expect(container).toBeDefined()
  })

  it('renders a heading', () => {
    render(<ProcessPage />)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders How It Works title', () => {
    render(<ProcessPage />)
    expect(screen.getAllByText('How It Works').length).toBeGreaterThanOrEqual(1)
  })

  it('renders Discovery step', () => {
    render(<ProcessPage />)
    expect(screen.getAllByText('Discovery').length).toBeGreaterThanOrEqual(1)
  })

  it('renders Get in Touch button', () => {
    render(<ProcessPage />)
    const buttons = screen.getAllByText('Get in Touch')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })
})
