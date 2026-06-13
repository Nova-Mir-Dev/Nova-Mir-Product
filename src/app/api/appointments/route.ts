import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'

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

  const body = (await request.json()) as {
    title: string
    description?: string
    startTime: string
    endTime: string
  }

  const admin = createServiceClient()
  const { data, error: insertError } = await admin
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
    console.error('Failed to create appointment:', insertError)
    return NextResponse.json(
      { error: 'Failed to create appointment.' },
      { status: 500 },
    )
  }

  return NextResponse.json(data, { status: 201 })
}
