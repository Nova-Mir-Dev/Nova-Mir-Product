import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProcessPage from '../page'

vi.mock('@/lib/content', () => ({
  getPublishedProcessSteps: vi.fn().mockResolvedValue(null),
}))

describe('ProcessPage', () => {
  it('renders a heading', async () => {
    render(await ProcessPage())
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders How It Works title', async () => {
    render(await ProcessPage())
    expect(screen.getAllByText('How It Works').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the fallback Discovery step when the DB has no steps', async () => {
    render(await ProcessPage())
    expect(screen.getAllByText('Discovery').length).toBeGreaterThanOrEqual(1)
  })

  it('renders DB steps when present', async () => {
    const { getPublishedProcessSteps } = await import('@/lib/content')
    vi.mocked(getPublishedProcessSteps).mockResolvedValueOnce([
      {
        id: '1',
        step_number: 1,
        title: 'Kickoff Call',
        description: 'We meet to align on scope.',
        page: 'process',
        sort_order: 1,
        is_published: true,
        created_at: '',
        updated_at: '',
      },
    ])
    render(await ProcessPage())
    expect(screen.getByText('Kickoff Call')).toBeInTheDocument()
  })

  it('renders Get in Touch link', async () => {
    render(await ProcessPage())
    expect(screen.getAllByText('Get in Touch').length).toBeGreaterThanOrEqual(1)
  })
})
