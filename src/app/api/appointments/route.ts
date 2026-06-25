import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { createAppointmentSchema } from '@/features/appointments/schemas'

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', user.id)
    .order('start_time', { ascending: true })

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = await rateLimit(`appointments:${user.id}`, 30, 60000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const parsed = createAppointmentSchema.safeParse(await request.json())
  if (!parsed.success) {
    Sentry.captureMessage('Appointments validation failed', {
      extra: {
        issueCount: parsed.error.issues.length,
        issuePaths: parsed.error.issues.map((i) => i.path.join('.')),
      },
    })
    return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
  }
  const body = parsed.data

  const { data, error: insertError } = await supabase
    .from('appointments')
    .insert({
      user_id: user.id,
      title: body.title,
      description: body.description ?? null,
      start_time: body.startTime,
      end_time: body.endTime,
      status: 'scheduled',
    })
    .select()
    .single()

  if (insertError) {
    Sentry.captureException(insertError)
    return NextResponse.json(
      { error: 'Failed to create appointment.' },
      { status: 500 },
    )
  }

  return NextResponse.json(data, { status: 201 })
}
