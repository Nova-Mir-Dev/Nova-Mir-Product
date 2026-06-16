import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from '@/lib/in-app-notifications'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const markReadBodySchema = z.object({
  notificationIds: z.array(z.string().trim().min(1)).optional(),
})

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(getNotifications(user.id))
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = await rateLimit(`notifications:${user.id}`, 60, 60000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const parsed = markReadBodySchema.safeParse(await request.json())
  if (!parsed.success) {
    Sentry.captureMessage('Notifications validation failed', {
      extra: { issues: parsed.error.issues },
    })
    return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
  }
  const { notificationIds } = parsed.data
  if (notificationIds && notificationIds.length > 0) {
    notificationIds.forEach((id) => void markAsRead(user.id, id))
  } else {
    void markAllAsRead(user.id)
  }
  return NextResponse.json({ success: true })
}
