import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import HomePage from '../page'
import en from '../../../../messages/en.json'

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {ui}
    </NextIntlClientProvider>,
  )
}

describe('HomePage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithI18n(<HomePage />)
    expect(container).toBeDefined()
  })

  it('renders a heading', () => {
    renderWithI18n(<HomePage />)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Services section', () => {
    renderWithI18n(<HomePage />)
    expect(screen.getAllByText('Services').length).toBeGreaterThanOrEqual(1)
  })

  it('renders How It Works section', () => {
    renderWithI18n(<HomePage />)
    expect(screen.getAllByText('How It Works').length).toBeGreaterThanOrEqual(1)
  })

  it('renders Pricing section', () => {
    renderWithI18n(<HomePage />)
    expect(screen.getAllByText('Pricing').length).toBeGreaterThanOrEqual(1)
  })

  it('renders CTA section', () => {
    renderWithI18n(<HomePage />)
    expect(
      screen.getAllByText('Think this could be a fit?').length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('renders Get Started button', () => {
    renderWithI18n(<HomePage />)
    const buttons = screen.getAllByText('Get Started')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })
})
