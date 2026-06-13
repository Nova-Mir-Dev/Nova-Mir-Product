import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AboutPage from '../page'

describe('AboutPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<AboutPage />)
    expect(container).toBeDefined()
  })

  it('renders a heading', () => {
    render(<AboutPage />)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders founder greeting', () => {
    render(<AboutPage />)
    expect(screen.getAllByText(/founder/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders philosophy section', () => {
    render(<AboutPage />)
    expect(screen.getAllByText(/philosophy/i).length).toBeGreaterThanOrEqual(1)
  })
})
