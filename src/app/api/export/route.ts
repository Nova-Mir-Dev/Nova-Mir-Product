import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const exportParamsSchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  entity: z.string().min(1).max(50).default('users'),
})

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

  const { allowed } = await rateLimit(`export:${user.id}`, 10, 60000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams)
  const parsed = exportParamsSchema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const { format, entity } = parsed.data

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
