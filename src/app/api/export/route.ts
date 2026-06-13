import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const supabase = await createServerClient()
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
  const url = new URL(request.url)
  const { searchParams } = url
  const format = searchParams.get('format') || 'json'
  const entity = searchParams.get('entity') || 'users'

  // TODO: Replace with actual data fetching
  const data: Array<Record<string, unknown>> = [{ id: 'example' }]

  if (format === 'csv') {
    const headers = Object.keys(data[0] || {}).join(',')
    const rows = data.map((row) => Object.values(row).join(',')).join('\n')
    return new NextResponse(`${headers}\n${rows}`, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${entity}.csv"`,
      },
    })
  }

  return NextResponse.json(data, {
    headers: { 'Content-Disposition': `attachment; filename="${entity}.json"` },
  })
}
