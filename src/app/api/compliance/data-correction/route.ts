import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = await rateLimit(`compliance:correction:${user.id}`, 10, 60000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  const body = (await request.json()) as {
    field: string
    value: string
    reason: string
  }
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
