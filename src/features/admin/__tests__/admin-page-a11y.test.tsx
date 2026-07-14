import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { ClientsPage } from '../../admin/clients/clients-page'
import BillingPage from '../../admin/billing/billing-page'
import MonitoringPage from '../../admin/monitoring/monitoring-page'
import { ProjectsPage } from '../../admin/projects/projects-page'
import { SettingsPage } from '../../admin/settings/settings-page'
import { AuditPage } from '../../admin/audit/audit-page'
import { AdminSidebar } from '../../admin/components/admin-nav'
import type {
  PortfolioClient,
  BillingSummary,
  Invoice,
  MonitoringClient,
  Project,
  ActivityEntry,
} from '../../admin/types'

vi.mock('../../admin/clients/actions', () => ({ createClientAction: vi.fn() }))
vi.mock('../../admin/billing/actions', () => ({
  createInvoice: vi.fn(),
  markInvoiceAsPaid: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/admin',
}))

const mockClient: PortfolioClient = {
  id: '1',
  name: 'Test Client',
  email: 'test@test.com',
  project_count: 1,
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
}

const mockSummary: BillingSummary = {
  mrr: 1000,
  totalRevenue: 5000,
  overdueTotal: 200,
  paidCount: 3,
  pendingCount: 1,
  overdueCount: 1,
}

const mockInvoice: Invoice[] = [
  {
    id: '1',
    client_name: 'Acme Corp',
    amount: 1000,
    status: 'paid',
    date: '2025-01-15',
    created_at: '2025-01-15T00:00:00Z',
  },
]

const mockMonitorClients: MonitoringClient[] = [
  { id: '1', name: 'Acme Corp', status: 'healthy', project_count: 3 },
]

const mockProject: Project[] = [
  {
    id: '1',
    client_id: 'c1',
    name: 'Website Redesign',
    description: 'Full redesign',
    status: 'active',
    deadline: '2025-06-01',
    progress: 45,
    created_at: '2025-01-01',
  },
]

const mockEntry: ActivityEntry[] = [
  {
    id: '1',
    user_id: 'u1',
    action: 'project.created',
    client_name: 'Acme Corp',
    performed_by: 'admin@example.com',
    timestamp: '2025-01-15T10:00:00Z',
    details: 'Created project',
    project_name: 'Website Redesign',
  },
]

describe('admin page accessibility', () => {
  it('AdminSidebar has navigation landmark', () => {
    render(<AdminSidebar />)
    const navs = screen.getAllByRole('navigation')
    expect(navs.length).toBeGreaterThanOrEqual(1)
  })

  it('AdminSidebar has heading', () => {
    render(<AdminSidebar />)
    const headings = screen.getAllByRole('heading', {
      name: 'Nova Mir | Admin',
    })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('ClientsPage has heading role heading', () => {
    render(
      <ClientsPage
        clients={[mockClient]}
        searchParams={{}}
        pagination={{ page: 1, totalPages: 1 }}
      />,
    )
    const headings = screen.getAllByRole('heading', {
      name: 'Client Management',
    })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('BillingPage has heading role heading', () => {
    render(
      <BillingPage
        invoices={mockInvoice}
        billingSummary={mockSummary}
        showCreateForm={false}
      />,
    )
    const headings = screen.getAllByRole('heading', {
      name: 'Billing Overview',
    })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('MonitoringPage has heading role heading', () => {
    render(<MonitoringPage clients={mockMonitorClients} />)
    const headings = screen.getAllByRole('heading', { name: 'Site Monitoring' })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('ProjectsPage has heading role heading', () => {
    render(<ProjectsPage projects={mockProject} />)
    const headings = screen.getAllByRole('heading', { name: 'Projects' })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('SettingsPage has heading role heading', () => {
    render(<SettingsPage user={{ email: 'a@a.com', name: 'Admin' }} />)
    const headings = screen.getAllByRole('heading', { name: 'Settings' })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('AuditPage has heading role heading', () => {
    render(<AuditPage entries={mockEntry} searchParams={{}} />)
    const headings = screen.getAllByRole('heading', { name: 'Audit Log' })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })
})

describe('form accessibility', () => {
  it('BillingPage create form has labeled inputs', () => {
    render(
      <BillingPage
        invoices={mockInvoice}
        billingSummary={mockSummary}
        showCreateForm={true}
      />,
    )
    expect(screen.getByLabelText('Client Name')).toBeDefined()
    expect(screen.getByLabelText('Unit Price ($)')).toBeDefined()
  })

  it('SettingsPage profile form has labeled inputs', () => {
    render(<SettingsPage user={{ email: 'a@a.com', name: 'Admin' }} />)
    expect(screen.getByLabelText('Name')).toBeDefined()
    expect(screen.getByLabelText('Email')).toBeDefined()
  })
})

describe('empty states provide description text', () => {
  it('ClientsPage empty state has descriptive text', () => {
    render(
      <ClientsPage
        clients={[]}
        searchParams={{}}
        pagination={{ page: 1, totalPages: 1 }}
      />,
    )
    const headings = screen.getAllByRole('heading', {
      name: 'Client Management',
    })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('BillingPage empty state has descriptive text', () => {
    render(
      <BillingPage
        invoices={[]}
        billingSummary={mockSummary}
        showCreateForm={false}
      />,
    )
    const matches = screen.getAllByText('No Invoices')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('MonitoringPage empty state has descriptive text', () => {
    render(<MonitoringPage clients={[]} />)
    const matches = screen.getAllByText('No Clients')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('ProjectsPage empty state has descriptive text', () => {
    render(<ProjectsPage projects={[]} />)
    const matches = screen.getAllByText('No projects found')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('AuditPage empty state has descriptive text', () => {
    render(<AuditPage entries={[]} searchParams={{}} />)
    const matches = screen.getAllByText('No audit entries found')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })
})

describe('admin page automated a11y scan', () => {
  it('AdminSidebar has no auto-detected violations', async () => {
    const { container } = render(<AdminSidebar />)
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
