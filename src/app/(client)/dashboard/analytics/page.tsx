import { Card, Stack, Text } from 'azimuth-ui'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { BarChartCard, PieChartCard } from './charts'

interface Project {
  id: string
  status: string
  progress: number
}

interface Invoice {
  id: string
  amount: number
  status: string
  date: string
}

interface Document {
  id: string
  category: string
  file_size: number
}

interface Activity {
  id: string
  timestamp: string
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/clients/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  const [projectsRes, invoicesRes, documentsRes, activityRes] =
    await Promise.all([
      supabase
        .from('projects')
        .select('id, status, progress')
        .eq('client_id', user.id),
      supabase
        .from('portfolio_invoices')
        .select('id, amount, status, date')
        .eq('client_name', (profile as { name?: string } | null)?.name ?? ''),
      supabase
        .from('documents')
        .select('id, category, file_size')
        .eq('user_id', user.id),
      supabase
        .from('activity_logs')
        .select('id, timestamp')
        .eq('user_id', user.id),
    ])

  const projects = (projectsRes.data ?? []) as Project[]
  const invoices = (invoicesRes.data ?? []) as Invoice[]
  const documents = (documentsRes.data ?? []) as Document[]
  const activities = (activityRes.data ?? []) as Activity[]

  const activeCount = projects.filter(
    (p) => p.status === 'active' || p.status === 'in_progress',
  ).length
  const activePct =
    projects.length > 0 ? Math.round((activeCount / projects.length) * 100) : 0
  const totalSpent = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0)

  const statusCounts = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  const projectStatusData = Object.entries(statusCounts).map(
    ([label, value]) => ({
      label: label.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value,
    }),
  )

  const monthlyMap = invoices.reduce<Record<string, number>>((acc, inv) => {
    const month = inv.date.slice(0, 7)
    acc[month] = (acc[month] || 0) + inv.amount
    return acc
  }, {})

  const monthlyData = Object.entries(monthlyMap)
    .sort()
    .map(([label, value]) => ({
      label,
      value: Math.round(value / 100),
    }))

  const paymentStatuses = invoices.reduce<Record<string, number>>(
    (acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1
      return acc
    },
    {},
  )

  const paymentData = Object.entries(paymentStatuses).map(([label, value]) => ({
    name: label.replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
  }))

  const categoryCounts = documents.reduce<Record<string, number>>(
    (acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1
      return acc
    },
    {},
  )

  const docData = Object.entries(categoryCounts).map(([label, value]) => ({
    name: label.replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
  }))

  const totalFileSize = documents.reduce(
    (sum, d) => sum + (d.file_size || 0),
    0,
  )

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const dayLabels: string[] = []
  const dayCounts: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
    const label = d.toISOString().slice(0, 10)
    dayLabels.push(label)
    dayCounts[label] = 0
  }

  activities.forEach((a) => {
    const day = a.timestamp.slice(0, 10)
    if (dayCounts[day] !== undefined) dayCounts[day]++
  })

  const activityData = dayLabels.map((label) => ({
    label: label.slice(5),
    value: dayCounts[label] ?? 0,
  }))

  return (
    <Stack spacing="lg">
      <Text element={{ as: 'h1', size: 'h3' }} weight="semibold">
        Analytics
      </Text>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--azimuth-space-md)',
        }}
      >
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
              Active Rate
            </Text>
            <Text element={{ as: 'p', size: 'h2' }} weight="bold">
              {activePct}%
            </Text>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: 'sm' }} color="secondary">
              Total Spent
            </Text>
            <Text element={{ as: 'p', size: 'h2' }} weight="bold">
              ${(totalSpent / 100).toLocaleString()}
            </Text>
          </Stack>
        </Card>
        <Card>
          <Stack spacing="xs">
            <Text element={{ size: 'sm' }} color="secondary">
              Documents
            </Text>
            <Text element={{ as: 'p', size: 'h2' }} weight="bold">
              {documents.length}
            </Text>
            <Text element={{ size: 'sm' }} color="secondary">
              {totalFileSize > 1_000_000
                ? (totalFileSize / 1_000_000).toFixed(1) + ' MB'
                : (totalFileSize / 1_000).toFixed(0) + ' KB'}
            </Text>
          </Stack>
        </Card>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 'var(--azimuth-space-md)',
        }}
      >
        {projectStatusData.length > 0 && (
          <BarChartCard title="Projects by Status" data={projectStatusData} />
        )}
        {monthlyData.length > 0 && (
          <BarChartCard
            title="Monthly Spending"
            data={monthlyData}
            color="#059669"
          />
        )}
        {paymentData.length > 0 && (
          <PieChartCard title="Payment Status" data={paymentData} />
        )}
        {docData.length > 0 && (
          <PieChartCard title="Documents by Category" data={docData} />
        )}
      </div>

      {activityData.some((d) => d.value > 0) && (
        <BarChartCard
          title="Activity (Last 30 Days)"
          data={activityData}
          color="#d97706"
        />
      )}

      {projects.length === 0 &&
        invoices.length === 0 &&
        documents.length === 0 && (
          <Card>
            <Stack
              spacing="sm"
              style={{
                textAlign: 'center',
                padding: 'var(--azimuth-space-lg)',
              }}
            >
              <Text color="secondary">
                No data to show yet. Start by adding projects or uploading
                documents.
              </Text>
            </Stack>
          </Card>
        )}
    </Stack>
  )
}
