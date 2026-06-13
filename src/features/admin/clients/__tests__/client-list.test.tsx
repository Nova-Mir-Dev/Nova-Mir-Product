import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClientList } from '../components/client-list'
import type { PortfolioClient } from '@/features/admin/types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

const mockClients: PortfolioClient[] = [
  {
    id: '1',
    name: 'Alice Corp',
    email: 'alice@example.com',
    project_count: 3,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Bob Inc',
    email: 'bob@example.com',
    project_count: 1,
    status: 'inactive',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
]

describe('ClientList', () => {
  it('renders a list of clients', () => {
    render(
      <ClientList
        clients={mockClients}
        pagination={{ page: 1, totalPages: 1 }}
      />,
    )

    expect(screen.getByText('Alice Corp')).toBeInTheDocument()
    expect(screen.getByText('Bob Inc')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('renders empty state when no clients provided', () => {
    render(<ClientList clients={[]} pagination={{ page: 1, totalPages: 1 }} />)

    expect(screen.getByText('No clients found')).toBeInTheDocument()
  })

  it('renders empty state with search context when searchQuery provided', () => {
    render(
      <ClientList
        clients={[]}
        searchQuery="nonexistent"
        pagination={{ page: 1, totalPages: 1 }}
      />,
    )

    expect(
      screen.getByText(/No clients matching.*nonexistent/),
    ).toBeInTheDocument()
  })

  it('renders links to client detail pages', () => {
    render(
      <ClientList
        clients={mockClients}
        pagination={{ page: 1, totalPages: 1 }}
      />,
    )

    const links = screen.getAllByText('Alice Corp')
    const anchor = links.find((el) => el.closest('a'))
    expect(anchor?.closest('a')).toHaveAttribute('href', '/admin/clients/1')
  })
})
