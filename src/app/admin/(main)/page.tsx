import { Card, Grid, KPICard, Stack, Text } from 'azimuth-ui'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/auth-guard'
import type { ActivityEntry } from '@/features/admin/types'

const QUICK_LINKS = [
  {
    href: '/admin/clients',
    label: 'Clients',
    description: 'Manage client accounts and information',
  },
  {
    href: '/admin/projects',
    label: 'Projects',
    description: 'Track project progress and deadlines',
  },
  {
    href: '/admin/billing',
    label: 'Billing',
    description: 'Invoices, payments, and revenue reports',
  },
  {
    href: '/admin/revenue',
    label: 'Revenue',
    description: 'Track revenue and expenses',
  },
  {
    href: '/admin/monitoring',
    label: 'Monitoring',
    description: 'Site status and health checks',
  },
  {
    href: '/admin/audit',
    label: 'Audit Log',
    description: 'Review activity and changes',
  },
  {
    href: '/admin/bootstrap',
    label: 'Bootstrap',
    description: 'Generate project scaffolding',
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    description: 'Admin configuration',
  },
]

interface DashboardData {
  totalClients: number
  activeProjects: number
  mrr: number
  overdueTotal: number
  openTickets: number
  pendingInvoices: number
  recentActivity: ActivityEntry[]
  clientStatusDistribution: { active: number; inactive: number; lead: number }
}

async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()

  const results = await Promise.all([
    supabase
      .from('portfolio_clients')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase.from('portfolio_invoices').select('*'),
    supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open'),
    supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('portfolio_clients').select('status'),
    supabase
      .from('portfolio_invoices')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  // Surface a data-layer failure instead of rendering it as legitimate zeroes.
  if (results.some((r) => r.error)) {
    throw new Error('Failed to load dashboard data')
  }

  const [
    { count: totalClients },
    { count: activeProjects },
    { data: invoices },
    { count: openTickets },
    { data: activity },
    { data: clients },
    { count: pendingInvoices },
  ] = results

  const rawInvoices = (invoices ?? []) as Array<{
    status: string
    amount: number
    date: string
  }>
  const paidInvoices = rawInvoices.filter((i) => i.status === 'paid')
  const overdueInvoices = rawInvoices.filter((i) => i.status === 'overdue')
  const totalRevenue = paidInvoices.reduce(
    (sum, i) => sum + Number(i.amount),
    0,
  )
  const monthCount =
    new Set(paidInvoices.map((i) => i.date.slice(0, 7))).size || 1

  const rawClients = (clients ?? []) as Array<{ status: string }>

  return {
    totalClients: totalClients ?? 0,
    activeProjects: activeProjects ?? 0,
    mrr: totalRevenue / monthCount,
    overdueTotal: overdueInvoices.reduce((sum, i) => sum + Number(i.amount), 0),
    openTickets: openTickets ?? 0,
    pendingInvoices: pendingInvoices ?? 0,
    recentActivity: (activity ?? []) as ActivityEntry[],
    clientStatusDistribution: {
      active: rawClients.filter((c) => c.status === 'active').length,
      inactive: rawClients.filter((c) => c.status === 'inactive').length,
      lead: rawClients.filter((c) => c.status === 'lead').length,
    },
  }
}

export default async function AdminDashboard() {
  await requireAdmin()

  const data = await getDashboardData()

  return (
    <Stack spacing="md">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Dashboard
      </Text>

      <Grid cols={{ base: 1, sm: 2, lg: 3 }} gap="var(--azimuth-space-md)">
        <KPICard
          value={String(data.totalClients)}
          label="Total Clients"
          variant="default"
          description={`${data.clientStatusDistribution.active} active, ${data.clientStatusDistribution.inactive} inactive, ${data.clientStatusDistribution.lead} leads`}
        />
        <KPICard
          value={String(data.activeProjects)}
          label="Active Projects"
          variant="accent"
        />
        <KPICard
          value={`$${data.mrr.toFixed(2)}`}
          label="MRR"
          variant="success"
        />
        <KPICard
          value={`$${data.overdueTotal.toFixed(2)}`}
          label="Overdue Total"
          variant="danger"
        />
        <KPICard
          value={String(data.openTickets)}
          label="Open Tickets"
          variant="warning"
        />
        <KPICard
          value={String(data.pendingInvoices)}
          label="Pending Invoices"
          variant="default"
        />
      </Grid>

      <Grid cols={{ base: 1, lg: 2 }} gap="var(--azimuth-space-md)">
        <Stack spacing="sm">
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Recent Activity
          </Text>
          {data.recentActivity.length === 0 ? (
            <Text color="muted">No recent activity.</Text>
          ) : (
            <Stack spacing="xs">
              {data.recentActivity.map((entry) => (
                <Card key={entry.id}>
                  <Stack spacing="xs">
                    <Text element={{ size: 'sm' }} weight="semibold">
                      {entry.action}
                    </Text>
                    <Text element={{ size: 'sm' }} color="secondary">
                      {entry.client_name}
                      {entry.project_name
                        ? ` \u2014 ${entry.project_name}`
                        : ''}
                      {entry.performed_by
                        ? ` \u2014 By: ${entry.performed_by}`
                        : ''}
                    </Text>
                    <Text element={{ size: 'xs' }} color="muted">
                      {new Date(entry.created_at).toLocaleString('en-US')}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>

        <Stack spacing="sm">
          <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
            Quick Links
          </Text>
          <Grid cols={{ base: 1, sm: 2 }} gap="var(--azimuth-space-sm)">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ textDecoration: 'none' }}
              >
                <Card>
                  <Stack spacing="xs">
                    <Text weight="semibold">{link.label}</Text>
                    <Text element={{ size: 'sm' }} color="secondary">
                      {link.description}
                    </Text>
                  </Stack>
                </Card>
              </Link>
            ))}
          </Grid>
        </Stack>
      </Grid>
    </Stack>
  )
}
