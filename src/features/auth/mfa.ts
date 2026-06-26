'use server'

import { createClient } from '@/lib/supabase-server'

export async function enrollMfa(factorType: 'totp' | 'phone' | 'webauthn' = 'totp') {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await (supabase.auth.mfa.enroll as any)({
    factorType,
  })
  if (error) return { error: error.message }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any

  const result: { id: string; type: string; qr?: string; secret?: string; uri?: string; webauthn?: unknown } = {
    id: d.id,
    type: factorType,
  }

  if (factorType === 'totp') {
    result.qr = d.totp?.qr_code
    result.secret = d.totp?.secret
    result.uri = d.totp?.uri
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
