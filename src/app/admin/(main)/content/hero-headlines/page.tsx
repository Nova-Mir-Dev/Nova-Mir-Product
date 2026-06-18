import { createClient } from '@/lib/supabase-server'
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Unauthorized</div>

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return <div>Forbidden</div>

  const { data: headlines } = await supabase
    .from('hero_headlines')
    .select('*')
    .order('sort_order')

  return <HeroHeadlinesPage headlines={(headlines ?? []) as HeroHeadline[]} />
}
