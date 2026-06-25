import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const createSchema = z.object({
  headline: z.string().trim().min(1).max(500),
  subtitle: z.string().trim().min(1).max(1000),
  cta_label: z.string().trim().min(1).max(200),
  cta_href: z.string().trim().min(1).max(500).default('/contact'),
  industry: z.string().trim().max(100).optional().nullable().default(null),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
})

const updateSchema = createSchema.partial().extend({
  id: z.string().min(1),
})

async function requireAdmin() {
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
  return user
}

export async function GET() {
  const user = await requireAdmin()
  if (user instanceof NextResponse) return user

  const admin = createServiceClient()
  const { data, error } = await admin
    .from('hero_headlines')
    .select('*')
    .order('sort_order')

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch hero headlines' },
      { status: 500 },
    )
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const user = await requireAdmin()
  if (user instanceof NextResponse) return user

  const { allowed } = await rateLimit(
    `admin:content:headlines:${user.id}`,
    30,
    60000,
  )
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) {
    Sentry.captureMessage('Admin headlines POST validation failed', {
      extra: {
        issueCount: parsed.error.issues.length,
        issuePaths: parsed.error.issues.map((i) => i.path.join('.')),
      },
    })
    return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
  }

  const admin = createServiceClient()
  const { data, error } = await admin
    .from('hero_headlines')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to create hero headline' },
      { status: 500 },
    )
  }

  revalidateTag('hero-headlines', { expire: 60 })
  return NextResponse.json(data, { status: 201 })
}

export async function PUT(request: Request) {
  const user = await requireAdmin()
  if (user instanceof NextResponse) return user

  const { allowed } = await rateLimit(
    `admin:content:headlines:${user.id}`,
    30,
    60000,
  )
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const parsed = updateSchema.safeParse(await request.json())
  if (!parsed.success) {
    Sentry.captureMessage('Admin headlines PUT validation failed', {
      extra: {
        issueCount: parsed.error.issues.length,
        issuePaths: parsed.error.issues.map((i) => i.path.join('.')),
      },
    })
    return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
  }

  const { id, ...body } = parsed.data
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) updates[key] = value
  }

  const admin = createServiceClient()
  const { data, error } = await admin
    .from('hero_headlines')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update hero headline' },
      { status: 500 },
    )
  }

  revalidateTag('hero-headlines', { expire: 60 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const user = await requireAdmin()
  if (user instanceof NextResponse) return user

  const { allowed } = await rateLimit(
    `admin:content:headlines:${user.id}`,
    30,
    60000,
  )
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  const admin = createServiceClient()
  const { error } = await admin.from('hero_headlines').delete().eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to delete hero headline' },
      { status: 500 },
    )
  }

  revalidateTag('hero-headlines', { expire: 60 })
  return NextResponse.json({ success: true })
}
