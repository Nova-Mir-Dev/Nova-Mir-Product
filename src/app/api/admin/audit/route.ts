import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createServiceClient()

  const { searchParams } = new URL(request.url)
  const actionFilter = searchParams.get('action')?.toLowerCase()
  const clientFilter = searchParams.get('client')?.toLowerCase()
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  let query = admin
    .from('activity_logs')
    .select('*')
    .order('timestamp', { ascending: false })

  if (dateFrom) query = query.gte('timestamp', dateFrom)
  if (dateTo) query = query.lte('timestamp', dateTo)

  const { data: entries, error: fetchError } = await query

  if (fetchError)
    return NextResponse.json(
      { error: 'Failed to fetch audit log' },
      { status: 500 },
    )

  let filtered = entries ?? []
  if (actionFilter)
    filtered = filtered.filter((e) =>
      e.action?.toLowerCase().includes(actionFilter),
    )
  if (clientFilter)
    filtered = filtered.filter((e) =>
      e.client_name?.toLowerCase().includes(clientFilter),
    )

  const mapped = filtered.map((e: Record<string, unknown>) => ({
    id: e.id,
    action: e.action,
    clientName: e.client_name,
    performedBy: e.performed_by,
    timestamp: e.timestamp,
    details: e.details,
  }))

  return NextResponse.json(mapped)
}
