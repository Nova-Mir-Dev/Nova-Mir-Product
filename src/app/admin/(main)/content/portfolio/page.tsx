import { requireAdmin } from '@/lib/auth-guard'
import { createServiceClient } from '@/lib/supabase-admin'
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
  await requireAdmin()

  const admin = createServiceClient()
  const { data: projects, error } = await admin
    .from('portfolio_projects')
    .select('*')
    .order('sort_order')

  if (error) throw new Error('Failed to load portfolio projects')

  return <PortfolioPage projects={(projects ?? []) as PortfolioProject[]} />
}
