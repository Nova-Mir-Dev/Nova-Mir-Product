import { createServiceClient } from './supabase-admin'

interface AuditEntry {
  action: string
  entity: string
  entityId?: string
  metadata?: Record<string, unknown>
  userId?: string
}

const PII_KEYS = new Set([
  'email',
  'phone',
  'message',
  'token',
  'password',
  'secret',
  'access_token',
  'refresh_token',
  'authorization',
  'cookie',
  'ssn',
  'address',
  'dob',
  'date_of_birth',
  'name',
  'full_name',
  'first_name',
  'last_name',
  'user_agent',
  'api_key',
  'private_key',
  'ip',
  'ip_address',
  'jwt',
])

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeValue)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (PII_KEYS.has(key.toLowerCase())) continue
      out[key] = sanitizeValue(val)
    }
    return out
  }
  return value
}

function sanitizeMetadata(
  metadata?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!metadata) return metadata
  return sanitizeValue(metadata) as Record<string, unknown>
}

/**
 * Writes an immutable audit-log row via the service-role client (bypasses RLS).
 *
 * `metadata` is sanitized to strip known PII keys (email, phone, auth tokens,
 * names, etc.) before insert; nested objects and arrays are walked recursively.
 * The helper never throws — any client construction or insert failure is
 * swallowed so audit logging cannot break the caller's request. It is safe to
 * fire-and-forget with `void logAudit(...)`; the returned promise resolves once
 * the insert has settled (or the failure was swallowed). `ip_address` is never
 * populated here because a trusted upstream value is not available from the
 * server action / route handler without explicit `x-forwarded-for` handling.
 *
 * @param entry.action - Dotted action identifier, e.g. `billing.invoice.create`.
 * @param entry.entity - Affected entity type, e.g. `invoice`.
 * @param entry.entityId - Optional id of the affected row (stored as text).
 * @param entry.metadata - Optional key/values; PII keys are stripped before insert.
 * @param entry.userId - Optional actor id; omitted when the actor is unknown.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const client = createServiceClient()
    const sanitized = sanitizeMetadata(entry.metadata)
    await client.from('audit_logs').insert({
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entityId ?? null,
      user_id: entry.userId ?? null,
      metadata: sanitized ?? null,
    })
  } catch (err) {
    void err
  }
}
