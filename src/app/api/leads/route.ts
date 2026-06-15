import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createClient as createAnonClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'
import { notifyNewLead } from '@/lib/slack'
import { createLeadSchema } from '@/features/leads/schemas'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
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
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1),
    100,
  )
  const offset = Math.max(
    parseInt(searchParams.get('offset') || '0', 10) || 0,
    0,
  )

  let query = supabase.from('leads').select('*', { count: 'exact' })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    Sentry.captureException(error)
    return NextResponse.json(
      { error: 'Failed to fetch leads.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ data, total: count ?? 0 })
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Unsupported Media Type. Expected application/json.' },
        { status: 415 },
      )
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const { allowed } = await rateLimit(`leads:${ip}`, 10, 60000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const body = await request.json()

    const parsed = createLeadSchema.safeParse(body)
    if (!parsed.success) {
      Sentry.captureMessage('Leads validation failed', {
        extra: { issues: parsed.error.issues },
      })
      return NextResponse.json(
        { error: 'Validation failed.' },
        { status: 400 },
      )
    }

    const {
      name,
      email,
      businessName,
      phone,
      serviceInterest,
      budgetRange,
      message,
      consent,
    } = parsed.data

    // Uses anon (browser) client so the insert respects RLS.
    // Requires a Supabase RLS policy allowing anon inserts on `leads`:
    //   CREATE POLICY "leads_anon_insert" ON leads FOR INSERT
    //     TO anon WITH CHECK (true);
    // See schema.sql for the existing admin-only policy.
    const supabase = createAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    )
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name,
        email,
        business_name: businessName,
        phone: phone || null,
        service_interest: serviceInterest || null,
        budget_range: budgetRange || null,
        message,
        consent,
      })
      .select()
      .single()

    if (error) {
      Sentry.captureException(error)
      return NextResponse.json(
        { error: 'Failed to save your message. Please try again later.' },
        { status: 500 },
      )
    }

    notifyNewLead({
      name,
      email,
      businessName,
      phone: phone || undefined,
      serviceInterest: serviceInterest || undefined,
      budgetRange: budgetRange || undefined,
      message,
    }).catch((err) => console.error('Slack notification failed:', err))

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 },
    )
  }
}
