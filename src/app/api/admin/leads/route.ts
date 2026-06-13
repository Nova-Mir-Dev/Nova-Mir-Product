import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const q = searchParams.get('q')

  const admin = createServiceClient()
  let query = admin.from('leads').select('*').order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%`,
    )
  }

  const { data: leads, error: leadsError } = await query
  if (leadsError) {
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 },
    )
  }

  return NextResponse.json(leads ?? [])
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { allowed: patchAllowed } = await rateLimit(`admin:leads:${user.id}`, 60, 60000)
  if (!patchAllowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const body = await request.json() as {
    id: string
    status?: string
    notes?: string
    source?: string
  }

  if (!body.id) {
    return NextResponse.json(
      { error: 'Lead ID is required' },
      { status: 400 },
    )
  }

  const updates: Record<string, string> = {
    updated_at: new Date().toISOString(),
  }
  if (body.status) updates.status = body.status
  if (body.notes !== undefined) updates.notes = body.notes
  if (body.source !== undefined) updates.source = body.source

  const admin = createServiceClient()
  const { data: lead, error: updateError } = await admin
    .from('leads')
    .update(updates)
    .eq('id', body.id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 },
    )
  }

  return NextResponse.json(lead)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { allowed: postAllowed } = await rateLimit(`admin:leads:${user.id}`, 60, 60000)
  if (!postAllowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const body = await request.json() as {
    name: string
    email: string
    phone?: string
    company?: string
    message?: string
    source?: string
    notes?: string
  }

  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json(
      { error: 'Name and email are required' },
      { status: 400 },
    )
  }

  const admin = createServiceClient()
  const { data: lead, error: createError } = await admin
    .from('leads')
    .insert({
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone ?? null,
      company: body.company ?? null,
      message: body.message ?? null,
      source: body.source ?? 'admin',
      notes: body.notes ?? null,
    })
    .select()
    .single()

  if (createError) {
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 },
    )
  }

  return NextResponse.json(lead, { status: 201 })
}
