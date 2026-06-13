'use client'

import Link from 'next/link'
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Pagination,
  Stack,
  Tabs,
  Text,
} from 'azimuth-ui'
import { useClientPagination } from '@/features/admin/hooks/use-client-pagination'
import type {
  PortfolioClient,
  Project,
  Invoice,
  SupportTicket,
  ActivityEntry,
} from '@/features/admin/types'

interface ClientDetailPageProps {
  client: PortfolioClient
  projects: Project[]
  invoices: Invoice[]
  tickets: SupportTicket[]
  activity: ActivityEntry[]
  matchedUserCount: number
}

const statusBadgeVariant = (
  status: string,
): 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'neutral'
    case 'pending':
      return 'warning'
    case 'suspended':
      return 'danger'
    default:
      return 'info'
  }
}

const projectStatusVariant = (
  status: string,
): 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'in_progress':
      return 'info'
    case 'on_hold':
      return 'warning'
    case 'cancelled':
      return 'danger'
    default:
      return 'neutral'
  }
}

const invoiceStatusVariant = (
  status: string,
): 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    case 'overdue':
      return 'danger'
    default:
      return 'neutral'
  }
}

const ticketStatusVariant = (
  status: string,
): 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'info'
    case 'in_progress':
      return 'warning'
    case 'resolved':
      return 'success'
    case 'closed':
      return 'neutral'
    default:
      return 'neutral'
  }
}

const projectColumns = [
  { key: 'name', title: 'Name', sortable: true },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
    render: (_: unknown, row: Project) => (
      <Badge variant={projectStatusVariant(row.status)}>
        {row.status.replace(/_/g, ' ')}
      </Badge>
    ),
  },
  {
    key: 'progress',
    title: 'Progress',
    sortable: true,
    render: (value: unknown) =>
      value !== null && typeof value === 'number' ? `${value}%` : '—',
  },
  {
    key: 'deadline',
    title: 'Deadline',
    sortable: true,
    render: (value: unknown) =>
      value ? new Date(value as string).toLocaleDateString() : '—',
  },
]

const invoiceColumns = [
  { key: 'client_name', title: 'Client', sortable: true },
  {
    key: 'amount',
    title: 'Amount',
    sortable: true,
    render: (value: unknown) => `$${(value as number).toFixed(2)}`,
  },
  {
    key: 'date',
    title: 'Date',
    sortable: true,
    render: (value: unknown) => new Date(String(value)).toLocaleDateString(),
  },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
    render: (_: unknown, row: Invoice) => (
      <Badge variant={invoiceStatusVariant(row.status)}>{row.status}</Badge>
    ),
  },
]

const ticketColumns = [
  { key: 'subject', title: 'Subject', sortable: true },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
    render: (_: unknown, row: SupportTicket) => (
      <Badge variant={ticketStatusVariant(row.status)}>
        {row.status.replace(/_/g, ' ')}
      </Badge>
    ),
  },
]

const activityColumns = [
  { key: 'action', title: 'Action', sortable: true },
  { key: 'performed_by', title: 'Performed By', sortable: true },
  {
    key: 'timestamp',
    title: 'Timestamp',
    sortable: true,
    render: (value: unknown) => new Date(String(value)).toLocaleString(),
  },
  {
    key: 'details',
    title: 'Details',
    render: (value: unknown) => (value ? (value as string) : '—'),
  },
]

function ProjectsTab({ projects }: { projects: Project[] }) {
  const { page, setPage, totalPages, pageData } = useClientPagination(
    projects,
    10,
  )

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects"
        description="No projects found for this client."
      />
    )
  }

  return (
    <Stack spacing="sm">
      <DataTable
        data={{
          columns: projectColumns,
          data: pageData,
          emptyMessage: 'No projects found.',
        }}
        pagination={{
          virtual: { enabled: true, threshold: 30, maxHeight: 500 },
        }}
      />
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showFirstLast
        />
      )}
    </Stack>
  )
}

function BillingTab({ invoices }: { invoices: Invoice[] }) {
  const { page, setPage, totalPages, pageData } = useClientPagination(
    invoices,
    10,
  )

  if (invoices.length === 0) {
    return (
      <EmptyState
        title="No invoices"
        description="No invoices found for this client."
      />
    )
  }

  return (
    <Stack spacing="sm">
      <DataTable
        data={{
          columns: invoiceColumns,
          data: pageData,
          emptyMessage: 'No invoices found.',
        }}
        pagination={{
          virtual: { enabled: true, threshold: 30, maxHeight: 500 },
        }}
      />
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showFirstLast
        />
      )}
    </Stack>
  )
}

function SupportTab({ tickets }: { tickets: SupportTicket[] }) {
  const { page, setPage, totalPages, pageData } = useClientPagination(
    tickets,
    10,
  )

  if (tickets.length === 0) {
    return (
      <EmptyState
        title="No tickets"
        description="No support tickets from this client."
      />
    )
  }

  return (
    <Stack spacing="sm">
      <DataTable
        data={{
          columns: ticketColumns,
          data: pageData,
          emptyMessage: 'No support tickets found.',
        }}
        pagination={{
          virtual: { enabled: true, threshold: 30, maxHeight: 500 },
        }}
      />
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showFirstLast
        />
      )}
    </Stack>
  )
}

function ActivityTab({ entries }: { entries: ActivityEntry[] }) {
  const { page, setPage, totalPages, pageData } = useClientPagination(
    entries,
    10,
  )

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No activity"
        description="No activity logged for this client."
      />
    )
  }

  return (
    <Stack spacing="sm">
      <DataTable
        data={{
          columns: activityColumns,
          data: pageData,
          emptyMessage: 'No activity logged.',
        }}
        pagination={{
          virtual: { enabled: true, threshold: 30, maxHeight: 500 },
        }}
      />
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showFirstLast
        />
      )}
    </Stack>
  )
}

export function ClientDetailPage({
  client: c,
  projects,
  invoices,
  tickets,
  activity,
  matchedUserCount,
}: ClientDetailPageProps) {
  const tabs = [
    {
      id: 'projects',
      label: `Projects (${String(projects.length)})`,
      content: <ProjectsTab projects={projects} />,
    },
    {
      id: 'invoices',
      label: `Billing (${String(invoices.length)})`,
      content: <BillingTab invoices={invoices} />,
    },
    {
      id: 'tickets',
      label: `Support (${String(tickets.length)})`,
      content: <SupportTab tickets={tickets} />,
    },
    {
      id: 'activity',
      label: `Activity (${String(activity.length)})`,
      content: <ActivityTab entries={activity} />,
    },
  ]

  return (
    <Stack spacing="md">
      <Stack direction="horizontal" justify="between" align="start">
        <Stack spacing="xs">
          <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
            {c.name}
          </Text>
          <Text color="muted">{c.email}</Text>
        </Stack>
        <Link href="/admin/clients">
          <Button variant="secondary" size="sm">
            Back to Clients
          </Button>
        </Link>
      </Stack>

      <Stack direction="horizontal" spacing="md">
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: 'sm' }} color="muted">
              Status
            </Text>
            <Badge variant={statusBadgeVariant(c.status)}>{c.status}</Badge>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: 'sm' }} color="muted">
              Projects
            </Text>
            <Text element={{ size: 'h4' }} weight="semibold">
              {c.project_count}
            </Text>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: 'sm' }} color="muted">
              Member Since
            </Text>
            <Text>{new Date(c.created_at).toLocaleDateString()}</Text>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: 'sm' }} color="muted">
              Users Matched
            </Text>
            <Text element={{ size: 'h4' }} weight="semibold">
              {matchedUserCount}
            </Text>
          </Stack>
        </Card>
      </Stack>

      <Tabs tabs={tabs} defaultTab="projects" />
    </Stack>
  )
}
