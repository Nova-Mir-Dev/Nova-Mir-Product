import { createServiceClient } from '../supabase-admin'

/**
 * Result of a bridge API-key verification.
 * `valid` is `true` when the key is recognised and active.
 * `error` is set only when `valid` is `false`.
 */
export interface BridgeAuthResult {
  valid: boolean
  error?: string
}

/**
 * Verifies a bridge API key against the database.
 *
 * Checks that the key starts with `nm_`, matches a non-revoked key in the
 * `api_keys` table (by prefix lookup), then updates `last_used_at`.
 * Uses the service-role client (bypasses RLS).
 *
 * @param apiKey - Raw API key from the request header, or `null`.
 * @returns `{ valid: true }` on success, or `{ valid: false, error }` on failure.
 */
export async function verifyBridgeApiKey(
  apiKey: string | null,
): Promise<BridgeAuthResult> {
  if (!apiKey || !apiKey.startsWith('nm_')) {
    return { valid: false, error: 'Missing or invalid API key format' }
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, scopes')
    .eq('prefix', apiKey.slice(0, 8))
    .is('revoked_at', null)
    .maybeSingle()

  if (error || !data) {
    return { valid: false, error: 'Invalid API key' }
  }

  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return { valid: true }
}
