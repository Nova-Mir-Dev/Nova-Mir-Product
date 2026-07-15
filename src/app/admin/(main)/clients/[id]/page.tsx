import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth-guard'
import { ClientDetailPage } from '@/features/admin/clients/client-detail-page'
import type {
  PortfolioClient,
  Project,
  Invoice,
  SupportTicket,
  ActivityEntry,
} from '@/features/admin/types'

export default async function ClientDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { supabase } = await requireAdmin()

  const { data: rawClient } = (await supabase
    .from('portfolio_clients')
    .select('*')
    .eq('id', id)
    .single()) as { data: PortfolioClient | null }

  if (!rawClient) notFound()
  const c: PortfolioClient = rawClient

  const { data: users } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', c.email)

  const matchedUsers = (users ?? []) as { id: string; email: string }[]
  const userIds = matchedUsers.map((u) => u.id)

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .in('client_id', userIds.length > 0 ? userIds : ['__none__'])
    .order('created_at', { ascending: false })

  const { data: invoices } = await supabase
    .from('portfolio_invoices')
    .select('*')
    .eq('client_name', c.name)
    .order('date', { ascending: false })

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .in('user_id', userIds.length > 0 ? userIds : ['__none__'])
    .order('created_at', { ascending: false })

  const { data: activity } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('client_name', c.name)
    .order('created_at', { ascending: false })

  return (
    <ClientDetailPage
      client={c}
      projects={(projects ?? []) as Project[]}
      invoices={(invoices ?? []) as Invoice[]}
      tickets={(tickets ?? []) as SupportTicket[]}
      activity={(activity ?? []) as ActivityEntry[]}
      matchedUserCount={userIds.length}
    />
  )
}
