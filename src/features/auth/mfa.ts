'use server'

import { createClient } from '@/lib/supabase-server'

export async function enrollMfa(
  factorType: 'totp' | 'phone' | 'webauthn' = 'totp',
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // The supabase-js enroll types only cover totp/phone; webauthn needs a cast.
  const enroll = supabase.auth.mfa.enroll.bind(supabase.auth.mfa) as (params: {
    factorType: 'totp' | 'phone' | 'webauthn'
  }) => Promise<{
    data: {
      id: string
      totp?: { qr_code?: string; secret?: string; uri?: string }
    } | null
    error: { message: string } | null
  }>
  const { data, error } = await enroll({ factorType })
  if (error || !data) return { error: error?.message ?? 'Enrollment failed' }

  const result: {
    id: string
    type: string
    qr?: string
    secret?: string
    uri?: string
    webauthn?: unknown
  } = {
    id: data.id,
    type: factorType,
  }

  if (factorType === 'totp') {
    result.qr = data.totp?.qr_code
    result.secret = data.totp?.secret
    result.uri = data.totp?.uri
  }

  return result
}

export async function verifyMfa(factorId: string, code: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.challenge({
    factorId,
  })
  if (error) return { error: error.message }
  const { data: _verifyData, error: verifyError } =
    await supabase.auth.mfa.verify({
      factorId,
      challengeId: data.id,
      code,
    })
  if (verifyError) return { error: verifyError.message }
  return { success: true }
}

export async function removeMfa(factorId: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.unenroll({ factorId })
  if (error) return { error: error.message }
  return { success: true }
}

export async function listMfaFactors() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) return { error: error.message }
  return data
}
