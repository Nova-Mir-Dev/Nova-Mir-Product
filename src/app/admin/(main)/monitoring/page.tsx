import { requireAdmin } from '@/lib/auth-guard'
import MonitoringPage from '@/features/admin/monitoring/monitoring-page'
import type { MonitoringClient } from '@/features/admin/types'

function mapStatus(dbStatus: string): MonitoringClient['status'] {
  if (dbStatus === 'active') return 'healthy'
  if (dbStatus === 'pending') return 'warning'
  return 'down'
}

export default async function AdminMonitoringPage() {
  const { supabase } = await requireAdmin()

  const { data: clients, error } = await supabase
    .from('portfolio_clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error('Failed to load monitoring data')

  const raw = (clients ?? []) as Array<{
    id: string
    name: string
    email: string
    status: string
    project_count: number
  }>

  const mapped: MonitoringClient[] = raw.map((c) => ({
    id: c.id,
    name: c.name,
    status: mapStatus(c.status),
    project_count: c.project_count,
  }))

  return <MonitoringPage clients={mapped} />
}
