import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { hasPermission } from '@/lib/roles'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const createKeySchema = z.object({
  name: z.string().max(100).optional(),
})

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!hasPermission(profile?.role || 'viewer', 'canManageUsers')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json({ keys: [] })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const parsed = createKeySchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.flatten() },
      { status: 400 },
    )

  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!hasPermission(profile?.role || 'viewer', 'canManageUsers')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { allowed } = await rateLimit(`admin:api-keys:${user.id}`, 30, 60000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    )
  }

  return NextResponse.json({ created: true })
}
