import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

function createAnonClientForContent() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )
}

type SupabaseClient = ReturnType<typeof createAnonClientForContent>

function createContentFetcher<T>(
  tag: string,
  fetcher: (supabase: SupabaseClient) => Promise<T | null>,
) {
  return cache(async () => {
    const supabase = createAnonClientForContent()
    return unstable_cache(async () => fetcher(supabase), [tag], {
      tags: [tag],
      revalidate: 60,
    })()
  })
}

export const getPublishedPricing = createContentFetcher(
  'pricing',
  async (supabase) => {
    const { data } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('is_published', true)
      .order('sort_order')
    return data
  },
)

export const getPublishedPortfolio = createContentFetcher(
  'portfolio',
  async (supabase) => {
    const { data } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('is_published', true)
      .order('sort_order')
    return data
  },
)

export const getPublishedNavLinks = createContentFetcher(
  'nav-links',
  async (supabase) => {
    const { data } = await supabase
      .from('public_nav_links')
      .select('*')
      .eq('is_published', true)
      .order('section')
      .order('sort_order')
    return data
  },
)

export const getPublishedHeadlines = createContentFetcher(
  'hero-headlines',
  async (supabase) => {
    const { data } = await supabase
      .from('hero_headlines')
      .select('*')
      .eq('is_published', true)
      .order('sort_order')
    return data
  },
)
