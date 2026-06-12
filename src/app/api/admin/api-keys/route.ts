import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { hasPermission } from '@/lib/roles'
import { createApiKey } from '@/lib/api-keys'

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!hasPermission(profile?.role || 'viewer', 'canManageUsers')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createServiceClient()
  const { data: keys } = await admin
    .from('api_keys')
    .select('id, name, prefix, scopes, created_at, last_used_at, expires_at, revoked_at')
    .is('revoked_at', null)
    .order('created_at', { ascending: false })

  return NextResponse.json({ keys: keys ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!hasPermission(profile?.role || 'viewer', 'canManageUsers')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name } = (await request.json()) as { name: string }
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }

  try {
    const admin = createServiceClient()
    const { key, prefix } = await createApiKey(
      name.trim(),
      profile?.role || 'viewer',
      user.id,
      admin,
    )
    return NextResponse.json({ created: true, key, prefix }, { status: 201 })
  } catch (err) {
    console.error('Failed to create API key:', err)
    return NextResponse.json(
      { error: 'Failed to create API key.' },
      { status: 500 },
    )
  }
}
