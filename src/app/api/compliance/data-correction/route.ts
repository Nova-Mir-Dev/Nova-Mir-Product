import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const dataCorrectionBodySchema = z.object({
  field: z.string().trim().min(1, 'Field is required'),
  value: z.string().trim().min(1, 'Value is required').max(500),
  reason: z.string().trim().min(1, 'Reason is required').max(2000),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = await rateLimit(
    `compliance:correction:${user.id}`,
    10,
    60000,
  )
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const parsed = dataCorrectionBodySchema.safeParse(await request.json())
  if (!parsed.success) {
    Sentry.captureMessage('Data correction validation failed', {
      extra: { issues: parsed.error.issues },
    })
    return NextResponse.json(
      { error: 'Validation failed.' },
      { status: 400 },
    )
  }
  const body = parsed.data
  const allowedFields = ['email', 'name', 'phone'] // Whitelist fields that can be self-corrected

  if (!allowedFields.includes(body.field)) {
    return NextResponse.json(
      { error: 'This field requires admin review' },
      { status: 400 },
    )
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ [body.field]: body.value })
    .eq('id', user.id)
  if (updateError)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.json({
    corrected: true,
    field: body.field,
    correctedAt: new Date().toISOString(),
  })
}
