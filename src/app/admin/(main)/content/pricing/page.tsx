import { requireAdmin } from '@/lib/auth-guard'
import { createServiceClient } from '@/lib/supabase-admin'
import { PricingPage } from '@/features/admin/pricing/pricing-page'

interface PricingTier {
  id: string
  name: string
  slug: string
  starting_price: number
  description: string | null
  features: string[]
  founding_note: string | null
  is_featured: boolean
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export default async function AdminContentPricingRoute() {
  await requireAdmin()

  const admin = createServiceClient()
  const { data: tiers } = await admin
    .from('pricing_tiers')
    .select('*')
    .order('sort_order')

  return <PricingPage tiers={(tiers ?? []) as PricingTier[]} />
}
