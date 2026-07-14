import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Vercel-cron keep-alive endpoint. Runs a trivial read against the database so
 * the free-tier Supabase project never hits its inactivity auto-pause window.
 * Authenticated via the CRON_SECRET bearer token Vercel sends to cron routes.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )

  const { error } = await supabase.from('pricing_tiers').select('name').limit(1)

  return NextResponse.json(
    { ok: !error, db: !error, timestamp: new Date().toISOString() },
    { status: error ? 503 : 200 },
  )
}

export const dynamic = 'force-dynamic'
