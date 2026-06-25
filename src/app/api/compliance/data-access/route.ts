import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import * as Sentry from '@sentry/nextjs'

export async function GET(request: Request) {
  try {
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
      .select('id, email, name, role, created_at')
      .eq('id', user.id)
      .single()
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, created_at, expires_at, ip_address, user_agent')
      .eq('user_id', user.id)
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, description, status, deadline, progress, created_at, updated_at')
      .eq('client_id', user.id)
    const { data: appointments } = await supabase
      .from('appointments')
      .select('id, title, description, start_time, end_time, status, created_at')
      .eq('user_id', user.id)
    const { data: payments } = await supabase
      .from('payments')
      .select('id, amount, currency, status, created_at')
      .eq('user_id', user.id)
    const { data: documents } = await supabase
      .from('documents')
      .select('id, name, file_path, file_type, file_size, category, created_at')
      .eq('user_id', user.id)
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('id, name, prefix, scopes, last_used_at, created_at, expires_at')
      .eq('user_id', user.id)
    const { data: supportTickets } = await supabase
      .from('support_tickets')
      .select('id, subject, description, status, priority, created_at, updated_at')
      .eq('user_id', user.id)
    const { data: leads } = await supabase
      .from('leads')
      .select('id, name, email, business_name, status, created_at')
      .eq('email', user.email)
    const { data: portfolioClients } = await supabase
      .from('portfolio_clients')
      .select('id, name, email, phone, company, status, created_at')
      .or(`email.eq.${user.email},name.eq.${user.user_metadata?.full_name ?? ''}`)
    const { data: signatures } = await supabase
      .from('signatures')
      .select('id, document_id, signed_at, valid_until, created_at')
      .eq('signer_id', user.id)
    const { data: activityLogs } = await supabase
      .from('activity_logs')
      .select('id, action, resource, resource_id, ip_address, created_at')
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
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
