import { NextResponse } from 'next/server'
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
  const body = await request.json().catch(() => ({}))
  const parsed = enrollBodySchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.flatten() },
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

  const result = await enrollMfa()
  if ('error' in result)
    return NextResponse.json({ error: 'Enrollment failed' }, { status: 400 })

  void logAudit({
    action: 'auth.mfa.enroll',
    entity: 'user',
    entityId: user.id,
    metadata: { factor_type: parsed.data.factorType ?? 'totp' },
    userId: user.id,
  })

  return NextResponse.json({
    id: result.id,
    qr: result.qr,
  })
}
