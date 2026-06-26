import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { allowed } = await rateLimit(`admin:dsar:${user.id}`, 30, 60000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const { data: events } = await supabase
      .from('activity_logs')
      .select('id, action, metadata, created_at')
      .ilike('action', 'dsar_%')
      .order('created_at', { ascending: false })
      .limit(100)

    return NextResponse.json({ events })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
