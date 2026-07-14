import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClientsPage } from '../../admin/clients/clients-page'
import BillingPage from '../../admin/billing/billing-page'
import MonitoringPage from '../../admin/monitoring/monitoring-page'
import { ProjectsPage } from '../../admin/projects/projects-page'
import { SettingsPage } from '../../admin/settings/settings-page'
import { AuditPage } from '../../admin/audit/audit-page'
import { ProjectsPageSkeleton } from '../../admin/projects/projects-page'
import { AuditPageSkeleton } from '../../admin/audit/audit-page'
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

const mockClients: PortfolioClient[] = [
  mockClient,
  {
    id: '2',
    name: 'Second Client',
    email: 'second@test.com',
    project_count: 0,
    status: 'inactive',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
]

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
  {
    id: '2',
    client_name: 'Globex Inc',
    amount: 2500,
    status: 'pending',
    date: '2025-02-01',
    created_at: '2025-02-01T00:00:00Z',
  },
]

const mockMonitorClients: MonitoringClient[] = [
  { id: '1', name: 'Acme Corp', status: 'healthy', project_count: 3 },
  { id: '2', name: 'Globex Inc', status: 'warning', project_count: 1 },
  { id: '3', name: 'Initech', status: 'down', project_count: 0 },
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
  {
    id: '2',
    client_id: 'c1',
    name: 'Mobile App',
    description: null,
    status: 'completed',
    deadline: null,
    progress: 100,
    created_at: '2025-02-01',
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
  {
    id: '2',
    user_id: 'u1',
    action: 'client.deleted',
    client_name: 'Old Client',
    performed_by: 'admin@example.com',
    timestamp: '2025-01-16T10:00:00Z',
    details: 'Deleted client',
    project_name: null,
  },
]

describe('admin page headings', () => {
  it('ClientsPage has h1 heading', () => {
    render(
      <ClientsPage
        clients={mockClients}
        searchParams={{}}
        pagination={{ page: 1, totalPages: 1 }}
      />,
    )
    const headings = screen.getAllByRole('heading', {
      level: 1,
      name: 'Client Management',
    })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('BillingPage has h1 heading', () => {
    render(
      <BillingPage
        invoices={mockInvoice}
        billingSummary={mockSummary}
        showCreateForm={false}
      />,
    )
    const headings = screen.getAllByRole('heading', {
      level: 1,
      name: 'Billing Overview',
    })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('MonitoringPage has h1 heading', () => {
    render(<MonitoringPage clients={mockMonitorClients} />)
    const headings = screen.getAllByRole('heading', {
      level: 1,
      name: 'Site Monitoring',
    })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('ProjectsPage has h1 heading', () => {
    render(<ProjectsPage projects={mockProject} />)
    const headings = screen.getAllByRole('heading', {
      level: 1,
      name: 'Projects',
    })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('SettingsPage has h1 heading', () => {
    render(<SettingsPage user={{ email: 'a@a.com', name: 'Admin' }} />)
    const headings = screen.getAllByRole('heading', {
      level: 1,
      name: 'Settings',
    })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('AuditPage has h1 heading', () => {
    render(<AuditPage entries={mockEntry} searchParams={{}} />)
    const headings = screen.getAllByRole('heading', {
      level: 1,
      name: 'Audit Log',
    })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })
})

describe('data rendering', () => {
  it('ClientsPage renders client data', () => {
    render(
      <ClientsPage
        clients={mockClients}
        searchParams={{}}
        pagination={{ page: 1, totalPages: 1 }}
      />,
    )
    expect(screen.getAllByText('Test Client').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Second Client').length).toBeGreaterThanOrEqual(
      1,
    )
    expect(screen.getAllByText('test@test.com').length).toBeGreaterThanOrEqual(
      1,
    )
  })

  it('BillingPage renders invoice data', () => {
    render(
      <BillingPage
        invoices={mockInvoice}
        billingSummary={mockSummary}
        showCreateForm={false}
      />,
    )
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Globex Inc').length).toBeGreaterThanOrEqual(1)
  })

  it('MonitoringPage renders client data', () => {
    render(<MonitoringPage clients={mockMonitorClients} />)
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Globex Inc').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Initech').length).toBeGreaterThanOrEqual(1)
  })

  it('ProjectsPage renders project data', () => {
    render(<ProjectsPage projects={mockProject} />)
    expect(
      screen.getAllByText('Website Redesign').length,
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Mobile App').length).toBeGreaterThanOrEqual(1)
  })

  it('AuditPage renders entry data', () => {
    render(<AuditPage entries={mockEntry} searchParams={{}} />)
    expect(
      screen.getAllByText('project.created').length,
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('client.deleted').length).toBeGreaterThanOrEqual(
      1,
    )
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThanOrEqual(1)
  })
})

describe('skeleton components', () => {
  it('ProjectsPageSkeleton renders skeleton elements', () => {
    const { container } = render(<ProjectsPageSkeleton />)
    const skeletons = container.querySelectorAll('[class*="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('AuditPageSkeleton renders skeleton elements', () => {
    const { container } = render(<AuditPageSkeleton />)
    const skeletons = container.querySelectorAll('[class*="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})

describe('AdminSidebar structure', () => {
  it('renders as a semantic nav element', () => {
    const { container } = render(<AdminSidebar />)
    const nav = container.querySelector('nav')
    expect(nav).not.toBeNull()
  })

  it('renders nav items as buttons with accessible names', () => {
    render(<AdminSidebar />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(11)
    for (const button of buttons) {
      const name =
        button.textContent?.trim() || button.getAttribute('aria-label')
      expect(name).toBeTruthy()
    }
  })

  it('header and footer links have accessible names', () => {
    render(<AdminSidebar />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(2)
    for (const link of links) {
      expect(link.textContent).toBeTruthy()
    }
  })
})
