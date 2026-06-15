'use server'

import { createClient } from '@/lib/supabase-server'

/** Enrolls the current user in TOTP MFA. Returns QR code data for setup. */
export async function enrollMfa() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  })
  if (error) return { error: error.message }
  return {
    id: data.id,
    qr: data.totp.qr_code,
    secret: data.totp.secret,
    uri: data.totp.uri,
  }
}

/** Verifies a TOTP code against an enrolled MFA factor. */
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

/** Removes an enrolled MFA factor for the current user. */
export async function removeMfa(factorId: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.unenroll({ factorId })
  if (error) return { error: error.message }
  return { success: true }
}

/** Lists all MFA factors (TOTP, phone, etc.) for the current user. */
export async function listMfaFactors() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) return { error: error.message }
  return data
}
