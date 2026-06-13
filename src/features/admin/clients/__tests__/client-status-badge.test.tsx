import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClientStatusBadge } from '../components/client-status-badge'

describe('ClientStatusBadge', () => {
  it('renders the status text', () => {
    render(<ClientStatusBadge status="active" />)
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('renders success variant for active status', () => {
    const { container } = render(<ClientStatusBadge status="active" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('success')
  })

  it('renders neutral variant for inactive status', () => {
    const { container } = render(<ClientStatusBadge status="inactive" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('neutral')
  })

  it('renders warning variant for pending status', () => {
    const { container } = render(<ClientStatusBadge status="pending" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('warning')
  })

  it('renders danger variant for suspended status', () => {
    const { container } = render(<ClientStatusBadge status="suspended" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('danger')
  })

  it('renders info variant for unknown status', () => {
    const { container } = render(<ClientStatusBadge status="unknown" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('info')
  })
})
