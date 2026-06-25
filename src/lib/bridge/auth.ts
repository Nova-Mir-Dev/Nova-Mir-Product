import { createServiceClient } from '../supabase-admin'

export interface BridgeAuthResult {
  valid: boolean
  error?: string
}

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
