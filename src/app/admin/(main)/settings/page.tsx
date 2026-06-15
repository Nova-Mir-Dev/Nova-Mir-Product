import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { SettingsPage } from '@/features/admin/settings/settings-page'

export default async function SettingsRoute() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/auth/login')

  const { data: profile } = await supabase
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

  return (
    <SettingsPage
      user={{ email: user.email!, name: profile?.name ?? null }}
      apiKeys={apiKeys ?? []}
    />
  )
}
