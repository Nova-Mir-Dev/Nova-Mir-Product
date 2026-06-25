import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'
import { updateLeadStatusSchema } from '@/features/leads/schemas'
import { logAudit } from '@/lib/audit-log'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const { allowed } = await rateLimit(`leads-patch:${ip}`, 20, 60000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      },
    )
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

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required.' },
        { status: 400 },
      )
    }

    const body = await request.json()

    const parsed = updateLeadStatusSchema.safeParse(body)
    if (!parsed.success) {
      Sentry.captureMessage('Lead status update validation failed', {
        extra: {
          issueCount: parsed.error.issues.length,
          issuePaths: parsed.error.issues.map((i) => i.path.join('.')),
        },
      })
      return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('leads')
      .update({ status: parsed.data.status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
      }
      Sentry.captureException(error)
      return NextResponse.json(
        { error: 'Failed to update lead.' },
        { status: 500 },
      )
    }

    void logAudit({
      action: 'lead.status.update',
      entity: 'lead',
      entityId: id,
      metadata: { fields_changed: ['status'] },
      userId: user.id,
    })

    return NextResponse.json({ data })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 },
    )
  }
}
