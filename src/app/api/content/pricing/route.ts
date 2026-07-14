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
      .from('pricing_tiers')
      .select('name, starting_price, description, features, is_featured')
      .eq('is_published', true)
      .order('sort_order')

    if (error) {
      return NextResponse.json(
        { error: 'Pricing temporarily unavailable' },
        { status: 503, headers: { 'Retry-After': '120' } },
      )
    }

    const normalized = (data ?? []).map((tier) => ({
      name: tier.name,
      startingPrice: tier.starting_price,
      description: tier.description ?? '',
      features: tier.features ?? [],
      isFeatured: tier.is_featured,
    }))

    return NextResponse.json(normalized)
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
