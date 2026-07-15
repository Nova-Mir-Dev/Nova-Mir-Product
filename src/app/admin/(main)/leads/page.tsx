import { requireAdmin } from '@/lib/auth-guard'
import { LeadsPage } from '@/features/admin/leads/leads-page'
import type { Lead } from '@/features/admin/types'

export default async function LeadsRoute() {
  const { supabase } = await requireAdmin()

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  return <LeadsPage leads={(leads ?? []) as Lead[]} />
}
