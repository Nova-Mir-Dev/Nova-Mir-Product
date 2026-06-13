import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch all user data across tables — only the authenticated user's own data
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    personalData: {
      profile,
      sessions,
    },
    // Legal basis and retention info — required by GDPR Art. 15
    processingPurposes: [
      'Account management and authentication',
      'Service delivery and support',
    ],
    retentionPeriods: {
      profile: 'Duration of account + 30 days after deletion',
      sessions: '30 days',
    },
    dataSharing: {
      categories: ['Email provider', 'Hosting provider'],
      safeguards: 'Standard Contractual Clauses with all processors',
    },
  })
}
