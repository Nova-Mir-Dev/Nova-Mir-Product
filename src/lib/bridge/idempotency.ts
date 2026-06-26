import { createServiceClient } from '../supabase-admin'

/**
 * Wrapper returned by idempotency helpers.
 * `status` is `'deduplicated'` when the key exists (callers should return the
 * cached result) or `'stored'` after successfully persisting the result.
 * `data` holds the cached response payload when present.
 */
export interface IdempotencyResult<T> {
  status: 'deduplicated' | 'stored'
  data?: T
}

/**
 * Looks up an idempotency key in the audit log.
 *
 * Returns the cached result when the key exists so the caller can replay the
 * previous response without re-executing the operation. Uses the service-role
 * client (bypasses RLS). Returns `null` when the key is empty or not found.
 *
 * @param key - Idempotency key to check.
 * @returns `{ status: 'deduplicated', data }` when found, or `null`.
 */
export async function checkIdempotency<T>(
  key: string,
): Promise<IdempotencyResult<T> | null> {
  if (!key) return null

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('audit_logs')
    .select('metadata')
    .eq('entity_id', `idempotency:${key}`)
    .maybeSingle()

  if (data?.metadata) {
    return { status: 'deduplicated', data: data.metadata as T }
  }

  return null
}

/**
 * Persists an idempotency record so future `checkIdempotency` calls with the
 * same key return the cached result.
 *
 * Inserts a row into `audit_logs` with action `idempotency_mark`. Uses the
 * service-role client (bypasses RLS). The key is namespaced with the
 * `idempotency:` prefix in the `entity_id` column.
 *
 * @param key - Idempotency key to store.
 * @param data - Response payload to cache for future lookups.
 */
export async function markIdempotent<T>(key: string, data: T): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('audit_logs').insert({
    action: 'idempotency_mark',
    entity: 'bridge',
    entity_id: `idempotency:${key}`,
    metadata: data as Record<string, unknown>,
  })
}
