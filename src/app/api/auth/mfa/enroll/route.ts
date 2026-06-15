import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { enrollMfa } from '@/features/auth/mfa'

export async function POST() {
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
  return NextResponse.json({
    id: result.id,
    qr: result.qr,
    secret: result.secret,
  })
}
