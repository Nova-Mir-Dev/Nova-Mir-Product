import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const createLeadBodySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().trim().email('Invalid email').max(254),
  phone: z.string().trim().max(50).optional().nullable().default(null),
  business_name: z.string().trim().max(200).optional().nullable().default(null),
  message: z.string().trim().max(10000).optional().nullable().default(null),
  source: z.string().trim().max(100).optional().nullable().default(null),
  notes: z.string().trim().max(5000).optional().nullable().default(null),
})

const updateLeadBodySchema = z.object({
  id: z.string().trim().min(1, 'Lead ID is required'),
  status: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  source: z.string().trim().optional(),
})

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
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
  let query = admin
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,email.ilike.%${q}%,business_name.ilike.%${q}%`,
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
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
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

  const { allowed: patchAllowed } = await rateLimit(
    `admin:leads:${user.id}`,
    60,
    60000,
  )
  if (!patchAllowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const parsed = updateLeadBodySchema.safeParse(await request.json())
  if (!parsed.success) {
    Sentry.captureMessage('Admin leads PATCH validation failed', {
      extra: {
        issueCount: parsed.error.issues.length,
        issuePaths: parsed.error.issues.map((i) => i.path.join('.')),
      },
    })
    return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
  }
  const body = parsed.data

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
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
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

  const { allowed: postAllowed } = await rateLimit(
    `admin:leads:${user.id}`,
    60,
    60000,
  )
  if (!postAllowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const parsed = createLeadBodySchema.safeParse(await request.json())
  if (!parsed.success) {
    Sentry.captureMessage('Admin leads POST validation failed', {
      extra: {
        issueCount: parsed.error.issues.length,
        issuePaths: parsed.error.issues.map((i) => i.path.join('.')),
      },
    })
    return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
  }
  const body = parsed.data

  const admin = createServiceClient()
  const { data: lead, error: createError } = await admin
    .from('leads')
    .insert({
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      business_name: body.business_name ?? null,
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
