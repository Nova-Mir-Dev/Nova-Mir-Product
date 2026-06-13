import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import BillingPage from '../billing-page'
import type { BillingSummary, Invoice } from '@/features/admin/types'

vi.mock('../actions', () => ({
  createInvoice: vi.fn(),
  markInvoiceAsPaid: vi.fn(),
}))

const mockInvoices: Invoice[] = [
  {
    id: '1',
    client_name: 'Acme Corp',
    amount: 1000,
    status: 'paid',
    date: '2025-01-15',
    created_at: '2025-01-15T00:00:00Z',
  },
  {
    id: '2',
    client_name: 'Globex Inc',
    amount: 2500,
    status: 'pending',
    date: '2025-02-01',
    created_at: '2025-02-01T00:00:00Z',
  },
  {
    id: '3',
    client_name: 'Initech',
    amount: 500,
    status: 'overdue',
    date: '2024-12-20',
    created_at: '2024-12-20T00:00:00Z',
  },
]

const mockSummary: BillingSummary = {
  mrr: 1000,
  totalRevenue: 1000,
  overdueTotal: 500,
  paidCount: 1,
  pendingCount: 1,
  overdueCount: 1,
}

describe('BillingPage', () => {
  it('renders the heading', () => {
    render(
      <BillingPage
        invoices={mockInvoices}
        billingSummary={mockSummary}
        showCreateForm={false}
      />,
    )
    expect(screen.getByText('Billing Overview')).toBeDefined()
  })

  it('renders KPI cards', () => {
    render(
      <BillingPage
        invoices={mockInvoices}
        billingSummary={mockSummary}
        showCreateForm={false}
      />,
    )
    expect(screen.getAllByText('MRR').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Total Revenue').length).toBeGreaterThanOrEqual(
      1,
    )
    expect(screen.getAllByText('Overdue Total').length).toBeGreaterThanOrEqual(
      1,
    )
  })

  it('renders create invoice button', () => {
    render(
      <BillingPage
        invoices={mockInvoices}
        billingSummary={mockSummary}
        showCreateForm={false}
      />,
    )
    expect(screen.getAllByText('Create Invoice').length).toBeGreaterThanOrEqual(
      1,
    )
  })

  it('shows create form when showCreateForm is true', () => {
    render(
      <BillingPage
        invoices={mockInvoices}
        billingSummary={mockSummary}
        showCreateForm={true}
      />,
    )
    expect(screen.getByLabelText('Client Name')).toBeDefined()
    expect(screen.getByLabelText('Unit Price ($)')).toBeDefined()
    expect(screen.getByLabelText('Quantity')).toBeDefined()
  })

  it('renders empty state when no invoices', () => {
    render(
      <BillingPage
        invoices={[]}
        billingSummary={mockSummary}
        showCreateForm={false}
      />,
    )
    expect(screen.getByText('No Invoices')).toBeDefined()
  })

  it('renders invoice count summaries', () => {
    render(
      <BillingPage
        invoices={mockInvoices}
        billingSummary={mockSummary}
        showCreateForm={false}
      />,
    )
    expect(screen.getAllByText(/Paid: 1/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Pending: 1/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Overdue: 1/).length).toBeGreaterThanOrEqual(1)
  })
})
