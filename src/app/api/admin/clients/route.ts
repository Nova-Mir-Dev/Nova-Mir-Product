import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'

export async function GET() {
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
  const { data: clients, error: clientsError } = await admin
    .from('portfolio_clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (clientsError)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 },
    )

  const mapped = (clients ?? []).map((c: Record<string, unknown>) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    projectCount: c.project_count ?? 0,
    status: c.status ?? 'active',
  }))

  return NextResponse.json(mapped)
}

export async function POST(request: Request) {
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

  const { allowed } = await rateLimit(`admin:clients:${user.id}`, 30, 60000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const body = (await request.json()) as { name: string; email: string }
  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json(
      { error: 'Name and email are required' },
      { status: 400 },
    )
  }

  const admin = createServiceClient()
  const { data: client, error: createError } = await admin
    .from('portfolio_clients')
    .insert({ name: body.name.trim(), email: body.email.trim() })
    .select()
    .single()

  if (createError)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 },
    )

  const mapped = {
    id: client.id,
    name: client.name,
    email: client.email,
    projectCount: client.project_count ?? 0,
    status: client.status ?? 'active',
  }

  return NextResponse.json(mapped, { status: 201 })
}
