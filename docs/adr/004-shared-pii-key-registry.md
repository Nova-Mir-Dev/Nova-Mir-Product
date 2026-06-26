# ADR-004: Shared PII Key Registry

- **Status**: Accepted
- **Date**: 2026-06-25
- **Context**: Two independent PII key blocklists existed in `src/lib/sentry-scrub.ts`
  (regex-based, 16 keys) and `src/lib/audit-log.ts` (Set-based, 23 keys). Neither was the
  authoritative source. Keys like `full_name`, `access_token`, `jwt`, `api_key` were covered
  by the audit log but not by Sentry scrubbing, risking PII leaks to error monitoring.
  Conversely, `credit`, `card`, `cvv` were covered by Sentry but not the audit log.
- **Decision**: Extract a shared `src/lib/pii.ts` that exports a single `PII_KEYS` RegExp
  covering the full union of both sets (27 entries). Both `sentry-scrub.ts` and `audit-log.ts`
  import from this shared source. Any future PII-scrubbing code must also import from here.
- **Consequences**:
  - Positive: Single source of truth. Adding a new PII key in one place protects all consumers.
  - Positive: Audit trail — the union covers all PII-like fields across both existing consumers.
  - Negative: Import dependency — cannot be used in edge-light environments without care
    (but both consumers already run in Node, and the regex is lightweight).
