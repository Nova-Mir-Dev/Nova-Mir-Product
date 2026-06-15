'use client'

import { createClient } from '@/lib/supabase'

/** Registers a WebAuthn passkey for the current user. */
export async function registerPasskey() {
  const supabase = createClient()
  const { data: _data, error } = await supabase.auth.registerPasskey()
  if (error) return { error: error.message }
  return { success: true }
}

/** Signs the user in using a WebAuthn passkey. */
export async function signInWithPasskey() {
  const supabase = createClient()
  const { data: _data, error } = await supabase.auth.signInWithPasskey()
  if (error) return { error: error.message }
  return { success: true }
}
