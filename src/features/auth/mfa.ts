'use server'

import { createClient } from '@/lib/supabase-server'

/**
 * Fresh-credential proof required before changing MFA configuration, so a
 * hijacked session cannot silently add or remove a factor. Admins (password
 * auth) re-enter their password; magic-link clients enter a fresh email code
 * obtained via {@link sendReauthCode}.
 */
export type StepUp =
  | { method: 'password'; password: string }
  | { method: 'email'; token: string }

async function verifyStepUp(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string | undefined,
  stepUp: StepUp | undefined,
): Promise<{ ok: true } | { error: string }> {
  if (!email) return { error: 'Unable to verify your identity.' }
  if (!stepUp) return { error: 'Re-enter your credentials to continue.' }

  if (stepUp.method === 'password') {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: stepUp.password,
    })
    if (error) return { error: 'Incorrect password.' }
    return { ok: true }
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token: stepUp.token,
    type: 'email',
  })
  if (error) return { error: 'Invalid or expired code.' }
  return { ok: true }
}

/**
 * Emails the caller a fresh sign-in code so they can prove identity before an
 * MFA change (used by magic-link clients who have no password).
 */
export async function sendReauthCode() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Unauthorized' }

  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: { shouldCreateUser: false },
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function enrollMfa(
  factorType: 'totp' | 'phone' | 'webauthn' = 'totp',
  stepUp?: StepUp,
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const reauth = await verifyStepUp(supabase, user.email, stepUp)
  if ('error' in reauth) return { error: reauth.error }

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

export async function removeMfa(factorId: string, stepUp?: StepUp) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const reauth = await verifyStepUp(supabase, user.email, stepUp)
  if ('error' in reauth) return { error: reauth.error }

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
