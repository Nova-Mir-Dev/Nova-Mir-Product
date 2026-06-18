import { createClient } from '@/lib/supabase-server'
import { PortfolioPage } from '@/features/admin/portfolio/portfolio-page'

interface PortfolioProject {
  id: string
  title: string
  slug: string
  description: string | null
  href: string | null
  thumbnail_url: string | null
  status: string
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export default async function AdminContentPortfolioRoute() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Unauthorized</div>

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return <div>Forbidden</div>

  const { data: projects } = await supabase
    .from('portfolio_projects')
    .select('*')
    .order('sort_order')

  return <PortfolioPage projects={(projects ?? []) as PortfolioProject[]} />
}
