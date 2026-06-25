import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable().default(null),
  href: z.string().trim().max(500).optional().nullable().default(null),
  thumbnail_url: z.string().trim().max(500).optional().nullable().default(null),
  status: z.enum(['draft', 'published']).default('draft'),
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

export async function GET(request: Request) {
  const user = await requireAdmin()
  if (user instanceof NextResponse) return user

  const { searchParams } = new URL(request.url)
  const published = searchParams.get('published')

  const admin = createServiceClient()
  let query = admin.from('portfolio_projects').select('*').order('sort_order')

  if (published === 'true') query = query.eq('is_published', true)
  else if (published === 'false') query = query.eq('is_published', false)

  const { data, error } = await query
  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch portfolio projects' },
      { status: 500 },
    )
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const user = await requireAdmin()
  if (user instanceof NextResponse) return user

  const { allowed } = await rateLimit(
    `admin:content:portfolio:${user.id}`,
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
    Sentry.captureMessage('Admin portfolio POST validation failed', {
      extra: {
        issueCount: parsed.error.issues.length,
        issuePaths: parsed.error.issues.map((i) => i.path.join('.')),
      },
    })
    return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
  }

  const admin = createServiceClient()
  const { data, error } = await admin
    .from('portfolio_projects')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to create portfolio project' },
      { status: 500 },
    )
  }

  revalidateTag('portfolio', { expire: 60 })
  return NextResponse.json(data, { status: 201 })
}

export async function PUT(request: Request) {
  const user = await requireAdmin()
  if (user instanceof NextResponse) return user

  const { allowed } = await rateLimit(
    `admin:content:portfolio:${user.id}`,
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
    Sentry.captureMessage('Admin portfolio PUT validation failed', {
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
    .from('portfolio_projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update portfolio project' },
      { status: 500 },
    )
  }

  revalidateTag('portfolio', { expire: 60 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const user = await requireAdmin()
  if (user instanceof NextResponse) return user

  const { allowed } = await rateLimit(
    `admin:content:portfolio:${user.id}`,
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
  const { error } = await admin.from('portfolio_projects').delete().eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to delete portfolio project' },
      { status: 500 },
    )
  }

  revalidateTag('portfolio', { expire: 60 })
  return NextResponse.json({ success: true })
}
