import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import { SettingsPage } from '@/features/admin/settings/settings-page'
import { listMfaFactors } from '@/features/auth/mfa'

export default async function SettingsRoute() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/auth/login')

  const admin = createServiceClient()
  const { data: profile } = await admin
    .from('users')
    .select('name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin/auth/login')

  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('id, prefix, created_at')
    .is('revoked_at', null)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const mfaResult = await listMfaFactors()
  const factors = 'error' in mfaResult ? [] : (mfaResult.all ?? []).map((f) => ({
    id: f.id,
    type: f.factor_type,
    created_at: f.created_at,
  }))

  return (
    <SettingsPage
      user={{ email: user.email!, name: profile?.name ?? null }}
      apiKeys={apiKeys ?? []}
      factors={factors}
    />
  )
}
