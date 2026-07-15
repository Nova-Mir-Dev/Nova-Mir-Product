import { requireAdmin } from '@/lib/auth-guard'
import { SettingsPage } from '@/features/admin/settings/settings-page'
import { listMfaFactors } from '@/features/auth/mfa'

export default async function SettingsRoute() {
  const { supabase, user, profile } = await requireAdmin()

  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('id, prefix, created_at')
    .is('revoked_at', null)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const mfaResult = await listMfaFactors()
  const factors =
    'error' in mfaResult
      ? []
      : (mfaResult.all ?? []).map((f) => ({
          id: f.id,
          type: f.factor_type,
          created_at: f.created_at,
          friendly_name: (f as { friendly_name?: string | null }).friendly_name,
        }))

  const prefs = (user.user_metadata?.notification_prefs ?? {}) as Record<
    string,
    boolean
  >

  return (
    <SettingsPage
      user={{ email: user.email!, name: profile?.name ?? null }}
      apiKeys={apiKeys ?? []}
      factors={factors}
      notificationPrefs={prefs}
    />
  )
}
