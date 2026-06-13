import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PrivacyPage from '../page'

describe('PrivacyPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<PrivacyPage />)
    expect(container).toBeDefined()
  })

  it('renders a heading', () => {
    render(<PrivacyPage />)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Privacy Policy title', () => {
    render(<PrivacyPage />)
    expect(screen.getAllByText('Privacy Policy').length).toBeGreaterThanOrEqual(1)
  })

  it('renders data collection section', () => {
    render(<PrivacyPage />)
    expect(screen.getAllByText(/information we collect/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders last updated date', () => {
    render(<PrivacyPage />)
    expect(screen.getAllByText(/last updated/i).length).toBeGreaterThanOrEqual(1)
  })
})
