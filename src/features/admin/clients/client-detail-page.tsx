import Link from 'next/link'
import { Badge, Button, Card, Stack, Tabs, Text } from 'azimuth-ui'
import type {
  PortfolioClient,
  Project,
  Invoice,
  SupportTicket,
  ActivityEntry,
} from '@/features/admin/types'
import { PaginatedTab } from './components/paginated-tab'
import { statusBadgeVariant } from './components/status-variants'
import {
  projectColumns,
  invoiceColumns,
  ticketColumns,
  activityColumns,
} from './components/columns'

interface ClientDetailPageProps {
  client: PortfolioClient
  projects: Project[]
  invoices: Invoice[]
  tickets: SupportTicket[]
  activity: ActivityEntry[]
  matchedUserCount: number
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
      content: (
        <PaginatedTab
          rows={projects}
          columns={projectColumns}
          emptyTitle="No projects"
          emptyDescription="No projects found for this client."
          emptyMessage="No projects found."
        />
      ),
    },
    {
      id: 'invoices',
      label: `Billing (${String(invoices.length)})`,
      content: (
        <PaginatedTab
          rows={invoices}
          columns={invoiceColumns}
          emptyTitle="No invoices"
          emptyDescription="No invoices found for this client."
          emptyMessage="No invoices found."
        />
      ),
    },
    {
      id: 'tickets',
      label: `Support (${String(tickets.length)})`,
      content: (
        <PaginatedTab
          rows={tickets}
          columns={ticketColumns}
          emptyTitle="No tickets"
          emptyDescription="No support tickets from this client."
          emptyMessage="No support tickets found."
        />
      ),
    },
    {
      id: 'activity',
      label: `Activity (${String(activity.length)})`,
      content: (
        <PaginatedTab
          rows={activity}
          columns={activityColumns}
          emptyTitle="No activity"
          emptyDescription="No activity logged for this client."
          emptyMessage="No activity logged."
        />
      ),
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
            <Text>{new Date(c.created_at).toLocaleDateString('en-US')}</Text>
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
