import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ContactPage from '../page'

describe('ContactPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<ContactPage />)
    expect(container).toBeDefined()
  })

  it('renders a heading', () => {
    render(<ContactPage />)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the form title', () => {
    render(<ContactPage />)
    expect(
      screen.getAllByText(/let.*s build something/i).length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('renders Send Message button', () => {
    render(<ContactPage />)
    const buttons = screen.getAllByText('Send Message')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders consent checkbox', () => {
    render(<ContactPage />)
    expect(screen.getAllByText(/consent/i).length).toBeGreaterThanOrEqual(1)
  })
})
