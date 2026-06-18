import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed } = await rateLimit(`compliance:access:${ip}`, 10, 900000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', user.id)
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', user.id)
  const { data: supportTickets } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('email', user.email)
  const { data: portfolioClients } = await supabase
    .from('portfolio_clients')
    .select('*')
    .or(`email.eq.${user.email},name.eq.${user.user_metadata?.full_name ?? ''}`)
  const { data: signatures } = await supabase
    .from('signatures')
    .select('*')
    .eq('signer_id', user.id)
  const { data: activityLogs } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', user.id)

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    personalData: {
      profile,
      sessions,
      projects,
      appointments,
      payments,
      documents,
      apiKeys,
      supportTickets,
      leads,
      portfolioClients,
      signatures,
      activityLogs,
    },
    processingPurposes: [
      'Account management and authentication',
      'Service delivery and support',
      'Project management and collaboration',
      'Payment processing and billing',
      'Customer support and communication',
    ],
    retentionPeriods: {
      profile: 'Duration of account + 30 days after deletion',
      sessions: '30 days',
      projects: 'Duration of account + 90 days after deletion',
      appointments: 'Duration of account + 90 days after deletion',
      payments: '7 years (legal obligation)',
      documents: 'Duration of account + 90 days after deletion',
      apiKeys: 'Duration of account',
      supportTickets: '3 years after resolution',
      leads: 'Until opt-out or 2 years after last contact',
      portfolioClients: 'Duration of relationship + 1 year',
      signatures: 'Duration of account + 7 years (legal obligation)',
      activityLogs: '90 days',
    },
    dataSharing: {
      categories: ['Email provider', 'Hosting provider', 'Payment processor'],
      safeguards: 'Standard Contractual Clauses with all processors',
    },
  })
}
