import { createClient } from '@/lib/supabase-server'
import { AuditPage, AuditPageSkeleton } from '@/features/admin/audit/audit-page'
import type { ActivityEntry } from '@/features/admin/types'
import { Suspense } from 'react'

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{
    action?: string
    client?: string
    from?: string
    to?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })

  if (params.from) query = query.gte('created_at', params.from)
  if (params.to) query = query.lte('created_at', params.to)

  const { data: entries } = await query

  let filtered = (entries ?? []) as unknown as ActivityEntry[]

  const actionFilter = params.action?.toLowerCase()
  if (actionFilter) {
    filtered = filtered.filter((e) =>
      e.action?.toLowerCase().includes(actionFilter),
    )
  }

  const clientFilter = params.client?.toLowerCase()
  if (clientFilter) {
    filtered = filtered.filter((e) =>
      e.client_name?.toLowerCase().includes(clientFilter),
    )
  }

  return (
    <Suspense fallback={<AuditPageSkeleton />}>
      <AuditPage
        entries={filtered}
        searchParams={{
          action: params.action,
          client: params.client,
          from: params.from,
          to: params.to,
        }}
      />
    </Suspense>
  )
}
