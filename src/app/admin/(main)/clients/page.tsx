import { createClient } from '@/lib/supabase-server'
import { ilikeContainsClause } from '@/lib/sanitize'
import { ClientsPage } from '@/features/admin/clients/clients-page'
import {
  getPaginationParams,
  getPaginationRange,
} from '@/features/admin/hooks/use-server-pagination'
import type { PortfolioClient } from '@/features/admin/types'

export default async function ClientsRoute({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    create?: string
    page?: string
    pageSize?: string
  }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { page, pageSize } = getPaginationParams(params)
  const from = (page - 1) * pageSize

  let query = supabase
    .from('portfolio_clients')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  const q = params.q?.toLowerCase()
  if (q) {
    query = query.or(
      [ilikeContainsClause('name', q), ilikeContainsClause('email', q)].join(
        ',',
      ),
    )
  }

  const {
    data: clients,
    count,
    error,
  } = await query.range(from, from + pageSize - 1)
  if (error) throw new Error('Failed to load clients')
  const { totalPages } = getPaginationRange(count ?? 0, page, pageSize)

  return (
    <ClientsPage
      clients={(clients ?? []) as PortfolioClient[]}
      searchParams={params}
      pagination={{ page, totalPages }}
    />
  )
}
