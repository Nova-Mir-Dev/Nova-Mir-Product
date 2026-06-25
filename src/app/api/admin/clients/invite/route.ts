import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { logAudit } from '@/lib/audit-log'
import { unauthorized, forbidden, internalError } from '@/lib/api-error'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const inviteBodySchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1).max(200),
  password: z.string().trim().min(6).optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) return unauthorized()

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') return forbidden()

    const { allowed } = await rateLimit(
      `admin:clients-invite:${user.id}`,
      10,
      60000,
    )
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const parsed = inviteBodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
    }

    const { email, name, password } = parsed.data

    const admin = createServiceClient()

    const { data: authUser, error: createUserError } =
      await admin.auth.admin.createUser({
        email,
        password: password ?? undefined,
        email_confirm: true,
        user_metadata: { name, role: 'client' },
      })

    if (createUserError) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 },
      )
    }

    const { error: updateError } = await admin
      .from('portfolio_clients')
      .update({ name, email })
      .eq('email', email)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update client record' },
        { status: 500 },
      )
    }

    const emailDomain = email.split('@')[1] ?? ''

    void logAudit({
      action: 'client.invite',
      entity: 'client',
      entityId: authUser.user.id,
      metadata: { email_domain: emailDomain },
      userId: user.id,
    })

    return NextResponse.json(
      {
        id: authUser.user.id,
        email: authUser.user.email,
        name,
      },
      { status: 201 },
    )
  } catch {
    return internalError()
  }
}
