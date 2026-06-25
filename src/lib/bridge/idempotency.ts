import { createServiceClient } from '../supabase-admin'

export interface IdempotencyResult<T> {
  status: 'deduplicated' | 'stored'
  data?: T
}

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

export async function markIdempotent<T>(key: string, data: T): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('audit_logs').insert({
    action: 'idempotency_mark',
    entity: 'bridge',
    entity_id: `idempotency:${key}`,
    metadata: data as Record<string, unknown>,
  })
}
