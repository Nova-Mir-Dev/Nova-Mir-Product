# Spec: Cross-Portal API Contracts

## Objective

Define zero-trust API contracts between Nova Mir portals before implementing bridge endpoints.

This covers AZF-ux8 / `Nova-Mir-Product-22l`.

## Principles

- Portals do not share direct database credentials across trust boundaries.
- Every bridge endpoint authenticates with a pre-shared API key and endpoint scope.
- Every mutation validates input with Zod at the route boundary.
- Every mutation is rate-limited to 100 requests per minute per API key prefix.
- Every response returns only fields needed by the caller.
- Every error uses `{ "error": string, "code": string }` with client-safe messages.

## Shared Request Requirements

Required headers:

```http
Authorization: Bearer nmir_live_xxx
Content-Type: application/json
X-Nova-Api-Version: 2026-06-01
X-Nova-Bridge: product-admin | admin-clients | clients-admin
X-Request-Id: uuid
```

Required for all `POST` endpoints:

```http
Idempotency-Key: uuid
```

Recommended environment variables:

```env
PRODUCT_ADMIN_BASE_URL=
PRODUCT_ADMIN_API_KEY=
ADMIN_CLIENTS_BASE_URL=
ADMIN_CLIENTS_API_KEY=
CLIENTS_ADMIN_BASE_URL=
CLIENTS_ADMIN_API_KEY=
BRIDGE_API_VERSION=2026-06-01
```

API keys must be hashed at rest, revocable, scoped, and rotated with an overlap window.

Recommended scopes:

- `product:admin:leads:create`
- `product:admin:leads:notify`
- `admin:clients:provision`
- `admin:clients:status:read`
- `clients:admin:project-status:read`

## Shared Response Requirements

Successful mutation responses include:

```json
{
  "data": {},
  "requestId": "8e5f9b63-25f6-42e3-b8cc-b26ef96b3b4f"
}
```

Error responses include:

```json
{
  "error": "Client-safe message",
  "code": "VALIDATION_ERROR"
}
```

Standard error codes:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `IDEMPOTENCY_CONFLICT`
- `RATE_LIMITED`
- `UPSTREAM_UNAVAILABLE`
- `INTERNAL_ERROR`

Status mapping:

| Status | Code | Use |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | Invalid body or query params |
| `401` | `UNAUTHORIZED` | Missing or invalid API key |
| `403` | `FORBIDDEN` | Valid key lacks required scope |
| `404` | `NOT_FOUND` | Requested entity does not exist for that bridge |
| `409` | `CONFLICT` | Duplicate or incompatible resource state |
| `409` | `IDEMPOTENCY_CONFLICT` | Same key reused with different payload |
| `429` | `RATE_LIMITED` | More than 100 requests per minute |
| `503` | `UPSTREAM_UNAVAILABLE` | Target portal cannot complete request |
| `500` | `INTERNAL_ERROR` | Unexpected server error |

Rate-limited responses include:

```http
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1782345600000
```

## Product -> Admin

### `POST /api/admin/leads`

Creates or idempotently syncs a public-site lead into Admin.

Required scope: `product:admin:leads:create`

Request:

```json
{
  "externalLeadId": "prod_lead_123",
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "businessName": "Example Co",
  "phone": "+15555555555",
  "serviceInterest": "Website + lead system",
  "budgetRange": "3000-5000",
  "timeline": "30-60 days",
  "referralSource": "website",
  "currentWebsite": "https://example.com",
  "message": "I need a new site.",
  "consent": true,
  "source": "product",
  "submittedAt": "2026-06-25T00:00:00.000Z",
  "metadata": {}
}
```

Success, new lead:

```http
201 Created
```

```json
{
  "data": {
    "leadId": "1fb1aa32-e0d4-4d5d-a6b4-ef43e55f7951",
    "status": "new",
    "created": true
  },
  "requestId": "8e5f9b63-25f6-42e3-b8cc-b26ef96b3b4f"
}
```

Success, idempotent replay:

```http
200 OK
```

```json
{
  "data": {
    "leadId": "1fb1aa32-e0d4-4d5d-a6b4-ef43e55f7951",
    "status": "new",
    "created": false
  },
  "requestId": "8e5f9b63-25f6-42e3-b8cc-b26ef96b3b4f"
}
```

### `POST /api/admin/leads/notify`

Requests Admin-owned notification delivery for an existing lead.

Required scope: `product:admin:leads:notify`

Request:

```json
{
  "leadId": "1fb1aa32-e0d4-4d5d-a6b4-ef43e55f7951",
  "channels": ["email", "slack"],
  "template": "new_lead",
  "metadata": {}
}
```

Success:

```http
202 Accepted
```

```json
{
  "data": {
    "notificationId": "notif_123",
    "queued": true
  },
  "requestId": "8e5f9b63-25f6-42e3-b8cc-b26ef96b3b4f"
}
```

## Admin -> Clients

### `POST /api/clients/provision`

Creates or idempotently updates client portal access after Admin converts a lead or creates a client.

Required scope: `admin:clients:provision`

Request:

```json
{
  "adminClientId": "client_123",
  "email": "ada@example.com",
  "name": "Ada Lovelace",
  "company": "Example Co",
  "phone": "+15555555555",
  "project": {
    "adminProjectId": "project_123",
    "name": "Website rebuild",
    "status": "planning"
  },
  "sendInvite": true,
  "metadata": {}
}
```

Success, created:

```http
201 Created
```

```json
{
  "data": {
    "clientUserId": "3ba35af0-0a02-4905-bf95-3050b2754d18",
    "clientId": "client_123",
    "projectId": "project_123",
    "inviteSent": true,
    "created": true
  },
  "requestId": "8e5f9b63-25f6-42e3-b8cc-b26ef96b3b4f"
}
```

### `GET /api/clients/status`

Returns whether a client exists and can access the client portal.

Required scope: `admin:clients:status:read`

Query params, one required:

- `email`
- `adminClientId`

Example:

```http
GET /api/clients/status?adminClientId=client_123
```

Success:

```json
{
  "data": {
    "exists": true,
    "clientUserId": "3ba35af0-0a02-4905-bf95-3050b2754d18",
    "adminClientId": "client_123",
    "email": "ada@example.com",
    "inviteSentAt": "2026-06-25T00:00:00.000Z",
    "lastLoginAt": null,
    "projectCount": 1
  },
  "requestId": "8e5f9b63-25f6-42e3-b8cc-b26ef96b3b4f"
}
```

## Future Clients -> Admin

### `GET /api/admin/projects/{id}/status`

Returns Admin-owned project status for a client portal view without exposing Admin internals.

Required scope: `clients:admin:project-status:read`

Success:

```json
{
  "data": {
    "projectId": "project_123",
    "status": "planning",
    "phase": "discovery",
    "progress": 20,
    "updatedAt": "2026-06-25T00:00:00.000Z"
  },
  "requestId": "8e5f9b63-25f6-42e3-b8cc-b26ef96b3b4f"
}
```

## Retry And Idempotency

- Callers may retry `POST` requests on `429`, `500`, and `503` with exponential backoff and jitter.
- Callers must reuse the same `Idempotency-Key` for retries of the same logical operation.
- Servers store the idempotency key, request hash, response status, and response body for at least 24 hours.
- Reusing a key with a different request hash returns `409 IDEMPOTENCY_CONFLICT`.
- `GET` endpoints are safe to retry.

## Implementation Notes

- Add a shared bridge auth helper before implementing endpoints.
- Add reusable bridge rate-limit response headers.
- Extend `ApiErrorCode` in `src/lib/api-error.ts` for `CONFLICT`, `IDEMPOTENCY_CONFLICT`, and `UPSTREAM_UNAVAILABLE` before bridge implementation.
- Align Upstash env var names before relying on Redis-backed rate limiting.
