import type { ErrorEvent, EventHint } from '@sentry/nextjs'

const PII_KEYS =
  /^(email|phone|name|message|address|ip|password|token|secret|key|hash|ssn|dob|birth|credit|card|cvv)$/i

/**
 * Scrub PII from a Sentry event before it is sent to the server.
 *
 * Redacts values whose keys look like personally identifiable fields
 * (email, phone, name, message, etc.) across `event.extra`, `event.request.data`,
 * `event.user`, and `event.breadcrumbs`. Also truncates long primitives and
 * caps array length to bound payload size. Returns the mutated event, or
 * `null` if the input was null.
 */
export function scrubPii(event: ErrorEvent | null, _hint?: EventHint): ErrorEvent | null {
  if (!event) return null
  if (event.extra) event.extra = scrubObject(event.extra)
  if (event.request?.data) event.request.data = scrubValue(event.request.data)
  if (event.user) {
    delete event.user.email
    delete event.user.ip_address
    if (event.user.id) event.user.id = '[redacted-id]'
  }
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((b) => ({
      ...b,
      data: b.data ? scrubObject(b.data) : undefined,
    }))
  }
  return event
}

/** Deep-clone an object, replacing PII-keyed values with `[REDACTED]` and scrubbing nested values. */
function scrubObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    out[k] = PII_KEYS.test(k) ? '[REDACTED]' : scrubValue(v)
  }
  return out
}

/** Recursively scrub an arbitrary value: truncate long strings, cap arrays, and recurse into objects. */
function scrubValue(v: unknown): unknown {
  if (v == null) return v
  if (typeof v === 'string') return v.length > 500 ? v.slice(0, 500) + '…' : v
  if (Array.isArray(v)) return v.slice(0, 50).map(scrubValue)
  if (typeof v === 'object') return scrubObject(v as Record<string, unknown>)
  return v
}
