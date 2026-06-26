import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    )

    const { data, error } = await supabase
      .from('hero_headlines')
      .select('id, headline, subtitle, cta_label, cta_href')
      .eq('is_published', true)
      .order('sort_order')

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch headlines' },
        { status: 500 },
      )
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
