# Lessons

## 2026-06-26: Auth flow — client-side login sets non-httpOnly cookies

- Non-obvious bug: `createBrowserClient().auth.signInWithPassword()` on the client sets session cookies via `document.cookie` with `httpOnly: false`. The middleware then can't see the tokens (or worse, JS can read them). Root cause: auth login was implemented as a client-side operation, but the server (middleware) needs httpOnly cookies for security. Fix: move login to a `'use server'` action using `createServerClient` from `@supabase/ssr`, which sets httpOnly `Set-Cookie` response headers.
- Security auditor should have caught this: ASVS V2/V3 checks "Cookies: httpOnly, secure, SameSite" and quality contract rule 12 requires "Secure cookies: httpOnly, secure, SameSite on auth cookies." Prevention: run a security audit on any auth flow before shipping, and always default to server-side login for admin portals.
- Service role in middleware: the role lookup in middleware was failing because RLS blocked `SELECT role FROM users` even for the authenticated user's own row. Using `createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY)` to bypass RLS is the standard fix, but it's safe because the query only runs after `getUser()` validates the session, and the user ID comes from the validated token, not user input.

## 2026-06-25: API tests, i18n scaffolding, Sentry PII, audit logging, full audit

- Non-obvious bug: Upstash env var naming — rate-limit.ts reads `UPSTASH_REDIS_REST_URL` (library convention) but `.env.example`/README/setup used `UPSTASH_REDIS_URL`. Root cause: env var names drifted between code and documentation. Prevention: add env var cross-reference check to audit skill — verify all vars consumed in code appear in `.env.example` and vice versa.
- Bridge beads moot after consolidation: created bridge primitives lib (auth.ts, idempotency.ts) before checking whether the intended bridge endpoints already existed as session-auth routes. They did. Prevention: before planning new API endpoints, check existing routes for equivalent session-auth variants covering the same use case.
- Parallel subagent file conflicts: Sentry PII subagent and audit-log subagent both modified many of the same route files concurrently. Merges succeeded, but this risks conflicts on larger edits. Prevention: avoid concurrent subagents editing overlapping file sets; sequence them or use fine-grained file assignments.
- Zod flatten leak pattern: 3 routes returned `parsed.error.flatten()` in error responses, leaking schema internals (field names, constraints). Root cause: reused a convenient error-reporting pattern without considering it reaches HTTP clients. Prevention: search for `parsed.error.flatten()` in route handlers during code review — should never appear in a `NextResponse`.
- Subagent work not tracked in git until session end: multiple subagents changed dozens of files across 5+ work streams, committed only at session close. An intermediate crash would lose work. Prevention: commit after each subagent completes its work unit, with descriptive messages.
- Audit reports in `.tmp/` are ephemeral (gitignored). Prevention: copy audit reports to `audit-history/YYYY-MM-DD/` at session close so they persist in git for trend tracking.
- Full audit identified 1 critical, 12 high, 7 medium findings across 13 dimensions. The two real security issues were the 3 flatten() leaks (H-01) and unprotected opt-out endpoint (H-03) — both now fixed. Biggest documentation gaps: README version drift and PRIVACY.md duplicate content.

## 2026-06-18: Hardcoded content audit + DSAR completeness

- Non-obvious bug: ComplianceRequestForm component was defined, tested, but never imported on any page. Root cause: no dead-code check verifies that exported components are actually rendered. Prevention: add "orphaned component" detection to full-audit skill.
- Surprise: ~100+ hardcoded content items scattered across 20+ files. Pricing, portfolio, nav, testimonials, headlines, section titles all hardcoded. No single source of truth. Prevention: content-database audit in full-audit skill.
- Plan council finding: generic JSONB content table is an anti-pattern. Typed tables per content domain are simpler, more queryable, and produce better admin UIs. This contradicted the initial "one table for everything" instinct. Prevention: always run plan council before content architecture decisions.
- DSAR gap: data-access and data-deletion endpoints only cover `users` and `sessions`. At least 8 other tables with user data are not covered (projects, appointments, payments, documents, api_keys, etc.). Prevention: full-audit should verify that every table with a user_id FK is covered by data-access/data-deletion.
- Content table design: locale column is YAGNI until actual i18n requirement exists. sort_order on every ordered content list prevents admin frustration. content_history + draft/publish from day one prevents the #1 admin complaint.
- Bead creation via bd: multiline bodies with special characters (SQL, JSON) break shell escaping. Use temp files for complex bead bodies.
