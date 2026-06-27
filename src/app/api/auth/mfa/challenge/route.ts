import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { z } from 'zod'

const challengeSchema = z.object({
  factorId: z.string().min(1),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = challengeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid factor ID' }, { status: 400 })
  }

  const { data, error } = await supabase.auth.mfa.challenge({
    factorId: parsed.data.factorId,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any

  return NextResponse.json({
    id: d.id,
    type: d.type,
    challenge: d.challenge ?? undefined,
    allow_credentials: d.allow_credentials ?? undefined,
  })
}
