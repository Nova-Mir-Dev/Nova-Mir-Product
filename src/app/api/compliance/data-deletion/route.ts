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

    // Use the service client: RLS only grants DELETE on a few *_own tables, so
    // a session-client delete silently no-ops on the rest. The session above
    // already authenticated the caller as the owner of this data.
    const admin = createServiceClient()
    const errors: string[] = []
    const del = async (label: string, p: PromiseLike<{ error: unknown }>) => {
      const { error } = await p
      if (error) errors.push(label)
    }

    // Delete FK children before parents (no cascade in the schema).
    const { data: invoices } = await admin
      .from('portfolio_invoices')
      .select('id')
      .eq('user_id', user.id)
    const invoiceIds = (invoices ?? []).map((i) => i.id as string)
    if (invoiceIds.length > 0) {
      await del(
        'line_items',
        admin.from('line_items').delete().in('invoice_id', invoiceIds),
      )
    }
    await del(
      'signatures',
      admin.from('signatures').delete().eq('signer_id', user.id),
    )
    await del(
      'projects',
      admin.from('projects').delete().eq('client_id', user.id),
    )

    const userIdTables = [
      'sessions',
      'appointments',
      'payments',
      'documents',
      'api_keys',
      'support_tickets',
      'activity_logs',
      'portfolio_invoices',
    ]
    for (const table of userIdTables) {
      await del(table, admin.from(table).delete().eq('user_id', user.id))
    }

    if (user.email) {
      await del(
        'ccpa_opt_outs',
        admin.from('ccpa_opt_outs').delete().eq('email', user.email),
      )
      await del(
        'portfolio_clients',
        admin.from('portfolio_clients').delete().eq('email', user.email),
      )
      const redactedId = crypto.randomUUID()
      await del(
        'leads',
        admin
          .from('leads')
          .update({
            name: `redacted-${redactedId}`,
            email: `redacted-${redactedId}@redacted.local`,
          })
          .eq('email', user.email),
      )
    }

    await del('users', admin.from('users').delete().eq('id', user.id))

    if (errors.length > 0) {
      Sentry.captureException(
        new Error(`DSAR deletion incomplete: ${errors.join(', ')}`),
        { extra: { userId: user.id, failedTables: errors } },
      )
      return NextResponse.json(
        { error: 'Deletion could not be fully completed. Support notified.' },
        { status: 500 },
      )
    }

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
