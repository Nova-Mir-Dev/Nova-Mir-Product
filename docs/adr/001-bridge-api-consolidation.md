# ADR-001: Bridge API Consolidation

- **Status**: Accepted
- **Date**: 2026-06-25
- **Context**: The project planned "bridge" API endpoints — lightweight, API-key-authenticated endpoints
  for external systems to create leads, provision clients, and submit intake forms. A `src/lib/bridge/`
  library with auth, idempotency, and shared types was created in anticipation.
- **Decision**: The bridge beads are classified as **moot** because the equivalent session-auth endpoints
  already exist: `POST /api/admin/leads` (lead intake) and `POST /api/admin/clients/invite`
  (client provisioning). Rather than duplicating each as an API-key variant, the session-auth
  endpoints are sufficient for the project's current integration needs. The bridge primitives
  library (`src/lib/bridge/auth.ts`, `idempotency.ts`, `types.ts`) is retained for future use
  if an external-system integration requiring API-key auth materialises.
- **Consequences**:
  - Positive: No duplicated endpoints to maintain. Lower surface area for security review.
  - Negative: Bridge primitives are untested and may drift from actual integration requirements.
  - Mitigation: If API-key-auth integration is needed, write a spec first and reconnect the primitives.
