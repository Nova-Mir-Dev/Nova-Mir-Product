import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import HomePage from '../page'
import en from '../../../../messages/en.json'

vi.mock('@/lib/content', () => ({
  getPublishedPricing: vi.fn().mockResolvedValue(null),
  getPricingTiers: vi.fn().mockResolvedValue([
    {
      name: 'Managed Website',
      startingPrice: 1800,
      features: ['Custom-designed site'],
      isFeatured: false,
      description: 'Small businesses that need a credible online presence.',
    },
    {
      name: 'Website + Lead System',
      startingPrice: 3000,
      features: ['Lead capture form'],
      isFeatured: true,
      description: 'Businesses ready to capture and track leads.',
    },
  ]),
}))

async function renderHome() {
  const page = await HomePage()
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {page}
    </NextIntlClientProvider>,
  )
}

describe('HomePage', () => {
  it('renders without crashing', async () => {
    const { container } = await renderHome()
    expect(container).toBeDefined()
  })

  it('renders a heading', async () => {
    await renderHome()
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Services section', async () => {
    await renderHome()
    expect(screen.getAllByText('Services').length).toBeGreaterThanOrEqual(1)
  })

  it('renders How It Works section', async () => {
    await renderHome()
    expect(screen.getAllByText('How It Works').length).toBeGreaterThanOrEqual(1)
  })

  it('renders Pricing section', async () => {
    await renderHome()
    expect(screen.getAllByText('Pricing').length).toBeGreaterThanOrEqual(1)
  })

  it('renders CTA section', async () => {
    await renderHome()
    expect(
      screen.getAllByText('Think this could be a fit?').length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('renders Get Started button', async () => {
    await renderHome()
    const buttons = screen.getAllByText('Get Started')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })
})
