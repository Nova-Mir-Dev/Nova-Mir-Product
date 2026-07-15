import { requireAdmin } from '@/lib/auth-guard'
import { createServiceClient } from '@/lib/supabase-admin'
import { HeroHeadlinesPage } from '@/features/admin/hero-headlines/hero-headlines-page'

interface HeroHeadline {
  id: string
  headline: string
  subtitle: string
  cta_label: string
  cta_href: string
  industry: string | null
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export default async function AdminContentHeroHeadlinesRoute() {
  await requireAdmin()

  const admin = createServiceClient()
  const { data: headlines } = await admin
    .from('hero_headlines')
    .select('*')
    .order('sort_order')

  return <HeroHeadlinesPage headlines={(headlines ?? []) as HeroHeadline[]} />
}
