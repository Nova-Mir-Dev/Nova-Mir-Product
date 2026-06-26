import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).optional(),
  starting_price: z.number().int().min(0),
  description: z.string().trim().max(1000).optional().nullable().default(null),
  features: z.array(z.string()).default([]),
  founding_note: z.string().trim().max(500).optional().nullable().default(null),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
})

const updateSchema = createSchema.partial().extend({
  id: z.string().min(1),
})

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

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
  try {
    const user = await requireAdmin()
    if (user instanceof NextResponse) return user

    const admin = createServiceClient()
    const { data, error } = await admin
      .from('pricing_tiers')
      .select('*')
      .order('sort_order')

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch pricing tiers' },
        { status: 500 },
      )
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdmin()
    if (user instanceof NextResponse) return user

    const { allowed } = await rateLimit(
      `admin:content:pricing:${user.id}`,
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
      Sentry.captureMessage('Admin pricing POST validation failed', {
        extra: {
          issueCount: parsed.error.issues.length,
          issuePaths: parsed.error.issues.map((i) => i.path.join('.')),
        },
      })
      return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
    }

    const body = { ...parsed.data }
    if (!body.slug) {
      body.slug = generateSlug(body.name)
    }

    const admin = createServiceClient()
    const { data, error } = await admin
      .from('pricing_tiers')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create pricing tier' },
        { status: 500 },
      )
    }

    revalidateTag('pricing', { expire: 60 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAdmin()
    if (user instanceof NextResponse) return user

    const { allowed } = await rateLimit(
      `admin:content:pricing:${user.id}`,
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
      Sentry.captureMessage('Admin pricing PUT validation failed', {
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
    if (updates.name && !updates.slug) {
      updates.slug = generateSlug(updates.name as string)
    }

    const admin = createServiceClient()
    const { data, error } = await admin
      .from('pricing_tiers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update pricing tier' },
        { status: 500 },
      )
    }

    revalidateTag('pricing', { expire: 60 })
    return NextResponse.json(data)
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAdmin()
    if (user instanceof NextResponse) return user

    const { allowed } = await rateLimit(
      `admin:content:pricing:${user.id}`,
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
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 },
      )
    }

    const admin = createServiceClient()
    const { error } = await admin.from('pricing_tiers').delete().eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete pricing tier' },
        { status: 500 },
      )
    }

    revalidateTag('pricing', { expire: 60 })
    return NextResponse.json({ success: true })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
