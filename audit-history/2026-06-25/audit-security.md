# Security Re-Audit Report

**Date:** 2026-06-25
**Scope:** Targeted re-audit after recent changes (Sentry PII scrubbing, audit logging, i18n, schema changes, OWASP spot-check)
**Previous audit confirmed:** 25/25 tables RLS, SSL enforcement, auth inline checks, rate limiting on mutations, generic error messages

---

## Summary

The codebase maintains a strong security posture overall. Sentry PII scrubbing is correctly wired across all three configs (server, edge, client) and handles nested objects via recursion. Audit logging properly sanitizes PII before DB writes, swallows errors, and all 8 call sites are correctly fire-and-forget. The `leads_anon_insert` policy now requires `consent=true` in both schema.sql and the migration. i18n locale detection is whitelisted against `['en', 'es']` — no injection vector. However, four routes leak `parsed.error.flatten()` in error responses, the DSAR and opt-out endpoints lack rate limiting, and the admin GET endpoints would benefit from rate limiting for defense-in-depth.

---

## Confirmed Secure

### 1. Sentry PII Scrubbing — ✓ CONFIRMED

| File                        | Status                       |
| --------------------------- | ---------------------------- |
| `sentry.server.config.ts:8` | `beforeSend: scrubPii` wired |
| `sentry.edge.config.ts:7`   | `beforeSend: scrubPii` wired |
| `sentry.client.config.ts:9` | `beforeSend: scrubPii` wired |

**`src/lib/sentry-scrub.ts` analysis:**

- PII regex: `/^(email\|phone\|name\|message\|address\|ip\|password\|token\|secret\|key\|hash\|ssn\|dob\|birth\|credit\|card\|cvv)$/i` — covers all common PII keys ✓
- `scrubObject()` (line 37-43): Recursively iterates all keys and redacts on PII match ✓
- `scrubValue()` (line 46-52): Handles nested objects, arrays (capped at 50), strings (truncated at 500 chars), nulls, primitives ✓
- `event.user.email` and `event.user.ip_address` explicitly deleted (line 23-24) ✓
- `event.user.id` replaced with `[redacted-id]` (line 25) ✓
- Breadcrumbs data also scrubbed (line 27-32) ✓
- All three sentry configs import from `@/lib/sentry-scrub` (alias resolves via tsconfig paths) ✓

### 2. Audit Logging — ✓ CONFIRMED

**`src/lib/audit-log.ts` analysis:**

- `PII_KEYS` Set (line 11-36): 23 keys covering email, phone, tokens, names, addresses, SSN, IP, JWT, etc. ✓
- `sanitizeValue()` (line 38-49): Recursively walks objects and arrays, drops PII-keyed entries (case-insensitive via `.toLowerCase()`) ✓
- `sanitizeMetadata()` wrapper (line 51-56): Null-safe entry point ✓
- Error swallowing in `catch` block (line 87-89): `void err` — never propagates ✓
- All 8 call sites use `void logAudit(...)` (fire-and-forget):
  | Call site | File:Line |
  |---|---|
  | document.upload | `src/app/api/documents/route.ts:55` |
  | compliance.dsar | `src/app/api/compliance/data-access/route.ts:83` |
  | setup.bootstrap | `src/app/setup/actions.ts:62` |
  | lead.update | `src/app/api/leads/[id]/route.ts:95` |
  | billing.invoice | `src/app/api/admin/billing/route.ts:200` |
  | auth.mfa.enroll | `src/app/api/auth/mfa/enroll/route.ts:40` |
  | client.create | `src/app/api/admin/clients/route.ts:104` |
  | client.invite | `src/app/api/admin/clients/invite/route.ts:81` |

- **audit_logs RLS** (`schema.sql:43-44`): `CREATE POLICY "audit_logs_admin_only" ON audit_logs FOR ALL USING (auth.role() = 'service_role')` — only service_role can access ✓
- Audit entries store: `action`, `entity`, `entity_id`, `user_id`, `metadata` (sanitized) — no PII leakage ✓

### 3. i18n Locale Detection — ✓ CONFIRMED

**`i18n/request.ts` analysis:**

- `locales` whitelist `['en', 'es']` (line 7) ✓
- `isLocale()` function validates cookie and Accept-Language values against whitelist (line 16-18) ✓
- Fallback to `DEFAULT_LOCALE = 'en'` if neither matches (line 33) ✓
- Messages imported from local JSON files `messages/en.json`, `messages/es.json` — trusted sources, not user-controlled ✓
- Library: `next-intl` is a well-maintained, widely-used i18n library — no injection vectors in locale handling ✓
- No custom request.ts exists at `src/i18n/request.ts` (the glob returned no results); the project uses `next-intl`'s built-in routing ✓

### 4. `parsed.error.issues` captureMessage calls — ✓ CONFIRMED SAFE

All 36 matches follow the pattern:

```ts
Sentry.captureMessage('...', {
  extra: {
    issueCount: parsed.error.issues.length,
    issuePaths: parsed.error.issues.map((i) => i.path.join('.')),
  },
})
```

- `issueCount` is a number — no PII ✓
- `issuePaths` are Zod field paths (e.g., `"email"`, `"name"`, `"phone"`) — schema metadata, not user data ✓
- Sentry's `beforeSend: scrubPii` doesn't scrub `issueCount` or `issuePaths` keys (they don't match the PII regex) — but this is correct because they don't contain PII ✓
- **No instance** passes the actual user input or raw `parsed.error` to Sentry ✓
- Files with these calls: `notifications`, `documents`, `leads`, `leads/[id]`, `admin/leads`, `admin/billing`, `admin/bootstrap`, `admin/content/portfolio`, `admin/content/hero-headlines`, `admin/clients`, `compliance/data-correction`, `auth/mfa/verify`, `appointments`

### 5. `leads_anon_insert` Policy — ✓ CONFIRMED

Both sources require `consent = true`:

- `schema.sql:394-396`: `CREATE POLICY "leads_anon_insert" ON leads FOR INSERT TO anon WITH CHECK (consent = true)` ✓
- `supabase/migrations/20260625_reconcile_schema_app.sql:140-143`: `DROP POLICY IF EXISTS "leads_anon_insert" ON leads; CREATE POLICY "leads_anon_insert" ON leads FOR INSERT TO anon WITH CHECK (consent = true)` ✓
- The Zod schema `createLeadSchema` at `src/features/leads/schemas.ts:44-46` enforces `consent: z.literal(true)` at the application layer ✓ (defense-in-depth)

### 6. Security Headers — ✓ CONFIRMED (`next.config.ts:19-70`)

| Header                       | Value                                                                                  | Status            |
| ---------------------------- | -------------------------------------------------------------------------------------- | ----------------- |
| `Strict-Transport-Security`  | `max-age=31536000; includeSubDomains`                                                  | ✓                 |
| `Content-Security-Policy`    | `default-src 'self'; script-src 'self' 'unsafe-inline' ...; upgrade-insecure-requests` | ⚠️ (see findings) |
| `X-Frame-Options`            | `SAMEORIGIN`                                                                           | ✓                 |
| `X-Content-Type-Options`     | `nosniff`                                                                              | ✓                 |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`                                                      | ✓                 |
| `Permissions-Policy`         | `camera=(), microphone=(), geolocation=()`                                             | ✓                 |
| `Cross-Origin-Opener-Policy` | `same-origin`                                                                          | ✓                 |
| `Cache-Control`              | `private, no-cache, no-store`                                                          | ✓                 |

---

## Findings

### HIGH — 3 findings

#### F1: DSAR route missing rate limiting

**File:** `src/app/api/admin/compliance/dsar/route.ts:4-28`

- **Risk:** An admin user could hammer the GET endpoint to enumerate DSAR events, performing a denial-of-service on the audit log query or leaking the full DSAR event list. No rate limiting on this read endpoint despite it querying `activity_logs` for all DSAR events.
- **Fix:** Add rate limiting to the GET handler, e.g.:
  ```ts
  import { rateLimit } from '@/lib/rate-limit'
  // after auth check:
  const { allowed } = await rateLimit(`admin:dsar:${user.id}`, 30, 60000)
  if (!allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  ```

#### F2: CCPA opt-out route missing rate limiting AND auth

**File:** `src/app/api/compliance/opt-out/route.ts`

- **Risk:** Public POST endpoint that accepts arbitrary `{ email }` and inserts into `ccpa_opt_outs`. No rate limiting, no auth, minimal validation (`typeof email !== 'string'` — no Zod schema, no email format validation). An attacker could flood the table with garbage entries.
- **Fix:** Add rate limiting by IP, use Zod validation for email format:
  ```ts
  const { allowed } = await rateLimit(`optout:${ip}`, 10, 60000)
  const parsed = z
    .object({ email: z.string().email().max(254) })
    .safeParse(await request.json())
  ```
  Note: This endpoint is intentionally public (CCPA requires unauthenticated opt-out), but it needs rate limiting.

#### F3: Three routes leak `parsed.error.flatten()` in error responses

| File                                   | Line | Issue                                             |
| -------------------------------------- | ---- | ------------------------------------------------- |
| `src/app/api/auth/mfa/enroll/route.ts` | 18   | `details: parsed.error.flatten()` in 400 response |
| `src/app/api/admin/api-keys/route.ts`  | 35   | `details: parsed.error.flatten()` in 400 response |
| `src/app/api/export/route.ts`          | 41   | `details: parsed.error.flatten()` in 400 response |

- **Risk:** `z.error.flatten()` returns field-level error messages (e.g., `{ fieldErrors: { email: ["Invalid email"], name: ["Required"] } }`). This leaks schema structure and field names to the client, aiding enumeration attacks. The Quality Contract rule 10 requires "Never return internal details to client."
- **Fix:** Replace with generic error message:
  ```ts
  return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
  ```
  (The other 12+ routes already use this safe pattern.)

### MEDIUM — 3 findings

#### F4: Admin GET endpoints missing rate limiting

| File                                         | Line  | Route                                           |
| -------------------------------------------- | ----- | ----------------------------------------------- |
| `src/app/api/admin/leads/route.ts`           | 25-73 | GET all leads (uses service_role, `select *`)   |
| `src/app/api/admin/clients/route.ts`         | 14-52 | GET all clients (uses service_role, `select *`) |
| `src/app/api/admin/compliance/dsar/route.ts` | 4-28  | GET DSAR events                                 |
| `src/app/api/admin/api-keys/route.ts`        | 11-28 | GET API keys                                    |

- **Risk:** These endpoints use `createServiceClient()` (bypasses RLS) to fetch all records. Without rate limiting, an admin could iterate rapidly to scrape the entire dataset. While admin access is already controlled, rate limiting provides defense-in-depth against credential stuffing or session hijacking scenarios.
- **Fix:** Add rate limiting to each GET handler. Pattern:
  ```ts
  const { allowed } = await rateLimit(`admin:leads:${user.id}`, 60, 60000)
  if (!allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  ```
  Note: POST/PATCH/DELETE handlers in these routes already have rate limiting — GET was missed.

#### F5: Data deletion endpoint leaks `userId`

**File:** `src/app/api/compliance/data-deletion/route.ts:73`

- **Risk:** Returns `userId: user.id` in the response body after deletion. An attacker who gains brief access to the user's session could confirm the user ID before being deleted. This is an information disclosure of the internal UUID — not critical but unnecessary.
- **Fix:** Remove `userId` from the response. The caller already knows their own identity.

#### F6: Admin leads GET uses service_role with user-controlled `q` parameter

**File:** `src/app/api/admin/leads/route.ts:48-62`

- **Risk:** The GET handler uses `createServiceClient()` (bypasses RLS) and passes the user-supplied `q` search parameter directly into a string-interpolated `.or()` query:
  ```ts
  query = query.or(
    `name.ilike.%${q}%,email.ilike.%${q}%,business_name.ilike.%${q}%`,
  )
  ```
  While Supabase's JS client parameterizes these values (not raw SQL injection), the `select('*')` with service_role returns ALL columns (including PII like email, phone, message). Combined with no rate limiting (F4), this enables bulk scraping.
- **Fix:** Add rate limiting to GET (see F4) and scope the select to only needed columns: `.select('id, name, email, business_name, status, source, notes, created_at')`.

### LOW — 2 findings

#### F7: CSP includes `'unsafe-inline'` in script-src

**File:** `next.config.ts:32`

- **Risk:** `script-src 'self' 'unsafe-inline'` prevents strict CSP from blocking XSS via inline scripts. Already acknowledged with a TODO comment citing Next.js App Router nonce support tracking (https://github.com/vercel/next.js/issues/55692). Low severity because Next.js doesn't inject user content into `<script>` tags, and the `dangerouslySetInnerHTML` calls in `layout.tsx:71`, `theme-script.tsx:4`, and `json-ld.tsx:50-58` use hardcoded strings only (no user input).
- **Fix:** Migrate to nonce-based CSP when Next.js App Router nonce support stabilizes.

#### F8: Code generator template leaks Zod messages in HTTP response

**File:** `src/features/bootstrapper/engine/generator/compliance-automation.ts:142`

- **Risk:** Template code for generated projects includes `parsed.error.issues.map(i => i.message).join(", ")` in the HTTP response. Not a vulnerability in this codebase (it's a template that generates code for other projects), but the generated project would have validation error leakage. Low severity because it's not in production routes here.
- **Fix:** Update the template to return a generic error message: `{ error: 'Validation failed.' }` instead of concatenating Zod messages.

---

## OWASP Top 10 Spot-Check

| Category                              | Assessment                                                                                                                                                                                                              |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A01: Broken Access Control**        | All checked routes have auth inline + role check. No IDOR found — routes verify `user.id` matches or admin role. `admin/compliance/dsar` correctly checks admin role. ✓                                                 |
| **A07: Identification/Auth Failures** | Rate limiting present on all mutation endpoints (POST/PATCH/PUT/DELETE). Exception: `opt-out` and `dsar` route. MFA endpoints have rate limiting by user ID (enroll) and IP (verify). ✓ with exceptions noted in F1, F2 |
| **A09: Security Logging Failures**    | 8 audit log call sites wired across key events (document upload, DSAR, bootstrap, lead updates, billing, MFA enroll, client create/invite). Audit logs stored in `audit_logs` table with service_role-only RLS. ✓       |

---

## Recommendations (Prioritized)

1. **HIGH** — Add rate limiting to `compliance/opt-out` (public, no auth, no rate limit) and `admin/compliance/dsar` (admin read)
2. **HIGH** — Replace 3 instances of `parsed.error.flatten()` in error responses with generic messages (mfa/enroll, api-keys, export)
3. **MEDIUM** — Add rate limiting to 4 admin GET endpoints (leads, clients, dsar, api-keys) that use service_role and return full row data
4. **MEDIUM** — Remove `userId` from data-deletion response; scope `select('*')` to only needed columns in admin leads GET
5. **LOW** — Track CSP nonce migration when Next.js stabilizes the feature
6. **LOW** — Fix code generator template to not leak Zod messages (compliance-automation.ts)
7. **LOW** — Add Sentry `captureMessage` for audit log failures (currently silently swallowed — intentional for resilience, but adding Sentry logging would help debugging)
