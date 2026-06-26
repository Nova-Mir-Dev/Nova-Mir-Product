import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

const optOutSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const { allowed } = await rateLimit(`compliance:opt-out:${ip}`, 5, 60000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const body: unknown = await request.json().catch(() => ({}))
    const parsed = optOutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'A valid email is required' },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const { error } = await supabase.from('ccpa_opt_outs').insert({
      email: parsed.data.email,
      ip_address: ip,
    })
    if (error) {
      return NextResponse.json(
        { error: 'Failed to record opt-out' },
        { status: 500 },
      )
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
