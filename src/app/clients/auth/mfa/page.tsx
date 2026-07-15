import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { MfaRedirectPage } from '@/features/auth/components/mfa-redirect-page'
import { listMfaFactors } from '@/features/auth/mfa'

export default async function ClientMfaRoute() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/clients/auth/login')

  const mfaResult = await listMfaFactors()
  // Fail closed: if factors can't be listed, we cannot verify the user has
  // cleared MFA, so do not fall through into the app.
  if ('error' in mfaResult)
    redirect('/clients/auth/login?reason=service_unavailable')
  const allFactors = mfaResult.all ?? []
  const verifiedFactors = allFactors
    .filter((f: { status: string }) => f.status === 'verified')
    .map(
      (f: {
        id: string
        factor_type: string
        friendly_name?: string | null
      }) => ({
        id: f.id,
        type: f.factor_type,
        friendly_name: f.friendly_name,
      }),
    )

  if (verifiedFactors.length === 0) redirect('/dashboard')

  return <MfaRedirectPage factors={verifiedFactors} redirectTo="/dashboard" />
}
