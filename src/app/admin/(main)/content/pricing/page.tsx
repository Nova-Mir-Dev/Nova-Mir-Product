import { createClient } from '@/lib/supabase-server'
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return <div>Unauthorized</div>

  const { data: profile } = await createServiceClient()
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return <div>Forbidden</div>

  const { data: tiers } = await supabase
    .from('pricing_tiers')
    .select('*')
    .order('sort_order')

  return <PricingPage tiers={(tiers ?? []) as PricingTier[]} />
}
