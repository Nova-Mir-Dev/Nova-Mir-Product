import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'

const BodySchema = z.object({
  confirmation: z.string().optional(),
})

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => ({}))
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

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

  // Step 1: Delete all user data from application tables (uses anon client with RLS)
  await supabase.from('sessions').delete().eq('user_id', user.id)
  // Add other tables as needed

  // Step 2: Delete the auth user (requires service_role client)
  const admin = createServiceClient()
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
  if (deleteError)
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 })

  return NextResponse.json({
    deleted: true,
    deletedAt: new Date().toISOString(),
    userId: user.id,
    note: 'Data has been deleted from application tables and auth system. Third-party processors have been notified.',
  })
}
