import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { enrollMfa } from '@/features/auth/mfa'
import { logAudit } from '@/lib/audit-log'
import { z } from 'zod'

const enrollBodySchema = z.object({
  factorType: z.enum(['totp', 'phone', 'webauthn']).optional(),
  friendlyName: z.string().max(100).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = enrollBodySchema.safeParse(body)
    if (!parsed.success)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      )
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { allowed } = await rateLimit(`mfa:enroll:${user.id}`, 5, 60000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const factorType = parsed.data.factorType ?? 'totp'
    const result = await enrollMfa(factorType)
    if ('error' in result)
      return NextResponse.json({ error: result.error }, { status: 400 })

    void logAudit({
      action: 'auth.mfa.enroll',
      entity: 'user',
      entityId: user.id,
      metadata: { factor_type: factorType },
      userId: user.id,
    })

    return NextResponse.json({
      id: result.id,
      type: factorType,
      ...('qr' in result ? { qr: result.qr, secret: result.secret, uri: result.uri } : {}),
      ...('webauthn' in result ? { webauthn: result.webauthn } : {}),
    })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
