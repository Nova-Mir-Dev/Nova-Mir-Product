import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: events } = await supabase
    .from('activity_logs')
    .select('id, action, metadata, created_at')
    .ilike('action', 'dsar_%')
    .order('created_at', { ascending: false })
    .limit(100)

  return NextResponse.json({ events })
}
