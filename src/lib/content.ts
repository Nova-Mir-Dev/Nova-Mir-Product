import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import type {
  NavLinkRow,
  PortfolioProjectRow,
  PricingTierRow,
  ProcessStepRow,
  TestimonialRow,
} from '@/types/content'
import { PRICING_TIERS } from '@/lib/pricing'

type SupabaseClient = ReturnType<typeof createClient>

let contentClient: SupabaseClient | null = null
function getContentClient(): SupabaseClient {
  if (!contentClient) {
    contentClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    )
  }
  return contentClient
}

function createContentFetcher<T>(
  tag: string,
  fetcher: (supabase: SupabaseClient) => Promise<T | null>,
) {
  return cache(async () => {
    const supabase = getContentClient()
    return unstable_cache(async () => fetcher(supabase), [tag], {
      tags: [tag],
      revalidate: 60,
    })()
  })
}

export const getPublishedPricing = createContentFetcher<PricingTierRow[]>(
  'pricing',
  async (supabase) => {
    const { data } = await supabase
      .from('pricing_tiers')
      .select(
        'name, starting_price, description, features, slug, is_featured, sort_order',
      )
      .eq('is_published', true)
      .order('sort_order')
    return data
  },
)

export interface PricingCard {
  name: string
  startingPrice: number
  features: string[]
  isFeatured: boolean
  description: string
}

/**
 * Normalized pricing tiers for public rendering (homepage cards + JSON-LD),
 * from the DB when published rows exist, otherwise the static fallback.
 * `isFeatured` always derives from the data, never from a description-text
 * match — see Nova-Mir-Product-94p.
 */
export async function getPricingTiers(): Promise<PricingCard[]> {
  const db = await getPublishedPricing()
  if (db && db.length > 0) {
    return db.map((t) => ({
      name: t.name,
      startingPrice: t.starting_price,
      features: t.features ?? [],
      isFeatured: t.is_featured,
      description: t.description ?? '',
    }))
  }
  return PRICING_TIERS.map((t) => ({
    name: t.name,
    startingPrice: t.startingPrice,
    features: t.features,
    isFeatured: t.isFeatured,
    description: t.description,
  }))
}

export const getPublishedPortfolio = createContentFetcher<
  PortfolioProjectRow[]
>('portfolio', async (supabase) => {
  const { data } = await supabase
    .from('portfolio_projects')
    .select('title, description, href, thumbnail_url, status, sort_order')
    .eq('is_published', true)
    .order('sort_order')
  return data
})

export const getPublishedNavLinks = createContentFetcher<NavLinkRow[]>(
  'nav-links',
  async (supabase) => {
    const { data } = await supabase
      .from('public_nav_links')
      .select('label, path, section, parent_id, sort_order')
      .eq('is_published', true)
      .order('section')
      .order('sort_order')
    return data
  },
)

export const getPublishedProcessSteps = createContentFetcher<ProcessStepRow[]>(
  'process-steps',
  async (supabase) => {
    const { data } = await supabase
      .from('process_steps')
      .select('step_number, title, description, page, sort_order')
      .eq('is_published', true)
      .order('sort_order')
    return data
  },
)

export const getPublishedTestimonials = createContentFetcher<TestimonialRow[]>(
  'testimonials',
  async (supabase) => {
    const { data } = await supabase
      .from('testimonials')
      .select(
        'id, quote, author_name, author_business, author_avatar_url, rating, sort_order',
      )
      .eq('is_published', true)
      .order('sort_order')
    return data
  },
)
