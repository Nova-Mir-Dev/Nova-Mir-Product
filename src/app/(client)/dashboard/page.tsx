import { Card, Stack, Text, Button } from 'azimuth-ui'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { openCustomerPortal } from './billing/actions'
import { ProjectProgressList } from './components/project-progress-list'
import {
  RecentActivityList,
  type DashboardActivity,
} from './components/recent-activity-list'

import type { Project, Invoice } from '@/types/entities'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/clients/auth/login')

  const { data: profileRes } = await supabase
    .from('users')
    .select('id, name, email, role')
    .eq('id', user.id)
    .single()
  const profile = profileRes ?? null

  const [projectsRes, activityRes, invoicesRes] = await Promise.all([
    supabase.from('projects').select('*').eq('client_id', user.id),
    supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('portfolio_invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false }),
  ])
  if (projectsRes.error || activityRes.error || invoicesRes.error) {
    throw new Error('Failed to load your dashboard')
  }

  const projects = (projectsRes.data ?? []) as Project[]
  const recentActivity = (activityRes.data ?? []) as DashboardActivity[]
  const allInvoices = (invoicesRes.data ?? []) as Invoice[]

  const activeProjects = projects.filter(
    (p) => p.status === 'active' || p.status === 'in_progress',
  )
  const nextInvoice = allInvoices.find(
    (i) => i.status === 'pending' || i.status === 'overdue',
  )

  const quickActions = [
    {
      label: 'View Projects',
      href: '/dashboard/projects',
      variant: 'primary' as const,
    },
    {
      label: 'Billing',
      href: '/dashboard/billing',
      variant: 'tertiary' as const,
    },
    {
      label: 'Documents',
      href: '/dashboard/documents',
      variant: 'tertiary' as const,
    },
    {
      label: 'Contact Support',
      href: '/dashboard/support',
      variant: 'tertiary' as const,
    },
  ]

  return (
    <Stack spacing="lg">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--azimuth-space-sm)',
          flexWrap: 'wrap',
        }}
      >
        <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
          Welcome{profile ? ', ' + profile.name : ''}
        </Text>
        <span
          style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: 'var(--azimuth-color-primary-bg, #e0e7ff)',
            color: 'var(--azimuth-color-primary, #4338ca)',
          }}
        >
          Active Client
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--azimuth-space-md)',
        }}
      >
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: 'sm' }} color="secondary">
              Active Projects
            </Text>
            <Text element={{ as: 'p', size: 'h2' }} weight="bold">
              {activeProjects.length}
            </Text>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: 'sm' }} color="secondary">
              Total Projects
            </Text>
            <Text element={{ as: 'p', size: 'h2' }} weight="bold">
              {projects.length}
            </Text>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: 'sm' }} color="secondary">
              Site Status
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--azimuth-color-success, #166534)',
                  display: 'inline-block',
                }}
              />
              <Text element={{ as: 'p', size: 'h4' }} weight="bold">
                Operational
              </Text>
            </div>
            <Text element={{ size: 'sm' }} color="secondary">
              All systems normal
            </Text>
          </Stack>
        </Card>
        {nextInvoice && (
          <Card>
            <Stack spacing="xs">
              <Text element={{ size: 'sm' }} color="secondary">
                Next Invoice
              </Text>
              <Text element={{ as: 'p', size: 'h2' }} weight="bold">
                ${(nextInvoice.amount / 100).toFixed(2)}
              </Text>
              <Text element={{ size: 'sm' }} color="secondary">
                Due {new Date(nextInvoice.date).toLocaleDateString('en-US')}
              </Text>
              <form action={openCustomerPortal}>
                <Button variant="primary" type="submit" size="sm">
                  Pay Now
                </Button>
              </form>
            </Stack>
          </Card>
        )}
      </div>

      <Stack spacing="sm">
        <Text element={{ as: 'h2', size: 'h5' }} weight="semibold">
          Quick Actions
        </Text>
        <div
          style={{
            display: 'flex',
            gap: 'var(--azimuth-space-sm)',
            flexWrap: 'wrap',
          }}
        >
          {quickActions.map((action) => (
            <a key={action.href} href={action.href}>
              <Button variant={action.variant} type="button">
                {action.label}
              </Button>
            </a>
          ))}
        </div>
      </Stack>

      <ProjectProgressList projects={activeProjects} />

      <RecentActivityList activity={recentActivity} />
    </Stack>
  )
}
