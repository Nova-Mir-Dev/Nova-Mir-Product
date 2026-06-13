import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import IntakePage from '../page'

describe('IntakePage', () => {
  it('renders without crashing', () => {
    const { container } = render(<IntakePage />)
    expect(container).toBeDefined()
  })

  it('renders a heading', () => {
    render(<IntakePage />)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders project intake title', () => {
    render(<IntakePage />)
    expect(screen.getAllByText(/tell me about your project/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders Submit Intake Form button', () => {
    render(<IntakePage />)
    const buttons = screen.getAllByText('Submit Intake Form')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Contact Info section', () => {
    render(<IntakePage />)
    expect(screen.getAllByText('Contact Info').length).toBeGreaterThanOrEqual(1)
  })

  it('renders consent checkbox', () => {
    render(<IntakePage />)
    expect(screen.getAllByText(/consent/i).length).toBeGreaterThanOrEqual(1)
  })
})
