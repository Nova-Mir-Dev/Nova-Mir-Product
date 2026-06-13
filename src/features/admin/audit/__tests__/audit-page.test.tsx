import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { AuditPage, AuditPageSkeleton } from '../audit-page'
import type { ActivityEntry } from '@/features/admin/types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

const mockEntries: ActivityEntry[] = [
  {
    id: '1',
    user_id: 'u1',
    action: 'project.created',
    client_name: 'Acme Corp',
    performed_by: 'admin@example.com',
    timestamp: '2025-01-15T10:00:00Z',
    details: 'Created project "Website Redesign"',
    project_name: 'Website Redesign',
  },
]

describe('AuditPage', () => {
  it('renders the heading', () => {
    const { getByText } = render(<AuditPage entries={[]} searchParams={{}} />)
    expect(getByText('Audit Log')).toBeDefined()
  })

  it('shows empty state when no entries', () => {
    const { getAllByText } = render(
      <AuditPage entries={[]} searchParams={{}} />,
    )
    expect(getAllByText('No audit entries found').length).toBeGreaterThan(0)
  })

  it('renders entries in data table', () => {
    const { getByText } = render(
      <AuditPage entries={mockEntries} searchParams={{}} />,
    )
    expect(getByText('project.created')).toBeDefined()
    expect(getByText('Acme Corp')).toBeDefined()
  })

  it('renders skeleton', () => {
    const { container } = render(<AuditPageSkeleton />)
    expect(
      container.querySelectorAll('[class*="skeleton"]').length,
    ).toBeGreaterThan(0)
  })
})
