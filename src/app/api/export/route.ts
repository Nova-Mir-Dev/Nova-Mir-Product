import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import * as Sentry from '@sentry/nextjs'
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

  const allowedEntities = ['users', 'leads', 'clients', 'projects', 'portfolio_invoices'] as const
  if (!allowedEntities.includes(entity as typeof allowedEntities[number])) {
    return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 })
  }

  const columnMap: Record<string, string> = {
    users: 'id, email, name, role, created_at',
    leads: 'id, name, email, business_name, phone, service_interest, budget_range, message, timeline, referral_source, current_website, status, source, notes, consent, created_at',
    clients: 'id, name, email, phone, company, status, project_count, created_at',
    projects: 'id, client_id, name, description, status, deadline, progress, created_at',
    portfolio_invoices: 'id, client_name, amount, status, due_date, invoice_number, date, created_at, paid_at',
  }

  const columns = columnMap[entity] || 'id, created_at'
  const { data: raw, error: fetchError } = await supabase
    .from(entity)
    .select(columns)
    .limit(10000)

  if (fetchError) {
    Sentry.captureException(fetchError)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }

  const data = raw as unknown as Array<Record<string, unknown>>

  function csvEscape(value: unknown): string {
    const str = String(value ?? '')
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    return str
  }

  if (format === 'csv') {
    if (data.length === 0) {
      return new NextResponse('', {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${entity}.csv"`,
        },
      })
    }
    const headers = Object.keys(data[0]!).map(csvEscape).join(',')
    const rows = data.map((row) =>
      Object.values(row).map(csvEscape).join(','),
    ).join('\n')
    return new NextResponse(headers + '\n' + rows + '\n', {
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
