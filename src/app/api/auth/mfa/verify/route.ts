import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { verifyMfa } from '@/features/auth/mfa'
import { z } from 'zod'

const verifyMfaBodySchema = z.object({
  factorId: z.string().trim().min(1, 'Factor ID is required'),
  code: z.string().trim().min(1, 'Code is required').max(10),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const { allowed } = await rateLimit(`mfa:verify:${ip}`, 5, 60000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const parsed = verifyMfaBodySchema.safeParse(await request.json())
  if (!parsed.success) {
    Sentry.captureMessage('MFA verify validation failed', {
      extra: { issues: parsed.error.issues },
    })
    return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
  }
  const { factorId, code } = parsed.data
  const result = await verifyMfa(factorId, code)
  if ('error' in result)
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  return NextResponse.json({ success: true })
}
