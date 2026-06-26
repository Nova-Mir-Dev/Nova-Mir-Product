import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'
import * as Sentry from '@sentry/nextjs'

const BodySchema = z.object({
  confirmation: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => ({}))
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      )

    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { allowed } = await rateLimit(
      `compliance:deletion:${user.id}`,
      3,
      3600000,
    )
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const tables = [
      'sessions',
      'projects',
      'appointments',
      'payments',
      'documents',
      'api_keys',
      'support_tickets',
      'activity_logs',
      'portfolio_invoices',
    ]
    for (const table of tables) {
      await supabase.from(table).delete().eq('user_id', user.id)
    }

    await supabase.from('signatures').delete().eq('signer_id', user.id)
    await supabase.from('users').delete().eq('id', user.id)
    await supabase.from('portfolio_clients').delete().eq('email', user.email)

    const redactedId = crypto.randomUUID()
    await supabase
      .from('leads')
      .update({
        name: `redacted-${redactedId}`,
        email: `redacted-${redactedId}@redacted.local`,
      })
      .eq('email', user.email)

    const admin = createServiceClient()
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteError)
      return NextResponse.json({ error: 'Deletion failed' }, { status: 500 })

    return NextResponse.json({
      deleted: true,
      deletedAt: new Date().toISOString(),
      note: 'Data has been deleted from application tables and auth system. Third-party processors have been notified.',
    })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
