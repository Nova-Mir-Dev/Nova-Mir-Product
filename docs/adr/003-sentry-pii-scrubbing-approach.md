# ADR-003: Sentry PII Scrubbing Approach

- **Status**: Accepted
- **Date**: 2026-06-25
- **Context**: Sentry captures errors with event extras, breadcrumbs, user context, and request
  data. The existing route handlers used `parsed.error.issues` in Sentry extra context, which
  includes user-submitted values. GDPR/CCPA compliance requires that no PII reaches error
  monitoring services.
- **Decision**: Apply PII scrubbing at the Sentry client boundary using `beforeSend` hooks
  in all three Sentry configurations (server, edge, client). The `scrubPii` function:
  - Strips known PII key names via regex (email, phone, name, token, secret, etc.)
  - Recurses into nested objects and arrays
  - Truncates long strings and caps array depth
  - Deletes `event.user.email` and `event.user.ip_address` explicitly
  - Also sanitized 17 `captureMessage` calls: replaced `extra: { issues: parsed.error.issues }`
    with `{ issueCount, issuePaths }` (structure without values)
- **Alternatives considered**:
  - Server-side pre-send middleware: more invasive, harder to keep consistent.
  - Sentry's built-in `denyUrls`/`allowUrls`: insufficient for field-level scrubbing.
  - Per-route manual scrubbing: fragile, easily missed on new routes.
- **Consequences**:
  - Positive: Single point of enforcement. All routes automatically protected.
  - Negative: `beforeSend` hooks run on every event, adding ~0.1ms per event.
  - Negative: PII key regex must be kept in sync with the audit logging PII set (ADR-004
    resolves this by extracting a shared `src/lib/pii.ts`).
