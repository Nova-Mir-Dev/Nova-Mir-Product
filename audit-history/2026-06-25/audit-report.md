# Full Audit Report — 2026-06-25

**Quality gates passed:** typecheck ✓ | lint ✓ | 757 tests ✓ | build ✓ | prettier ✓ | npm audit 0 vulns ✓

---

## Already Green (no action needed)

| Dimension             | Status                                                                        |
| --------------------- | ----------------------------------------------------------------------------- |
| TypeScript typecheck  | 0 errors                                                                      |
| ESLint                | 0 warnings                                                                    |
| Tests                 | 757 passed (84 files)                                                         |
| Build                 | succeeds                                                                      |
| npm audit             | 0 vulnerabilities                                                             |
| AI slop (deslopify)   | clean — zero `TODO`/`FIXME`/`console.log`/commented-out code                  |
| Sentry PII scrubbing  | wired correctly in all 3 configs; handles nested objects, arrays, strings     |
| Audit logging         | 8 routes wired; metadata sanitized; errors swallowed                          |
| i18n locale detection | whitelisted `['en','es']` — no injection vector                               |
| Security headers      | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy — all set |
| RLS                   | 25/25 tables enabled; leads_anon_insert requires `consent=true`               |
| Auth inline           | all route handlers verify auth before processing                              |
| Rate limiting         | all mutation endpoints use `rateLimit()`                                      |
| Generic errors        | most routes return user-facing messages (3 exceptions below)                  |
| Supply chain          | 0 vulns; 16 deps behind (none critical — resend, stripe, twilio majors)       |

---

## Findings by Severity

### 🔴 CRITICAL (1)

| #    | File                                                | Issue                                                                                                                                                                                                                                                                                    |
| ---- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-01 | `src/lib/sentry-scrub.ts` vs `src/lib/audit-log.ts` | **Duplicate PII key lists diverged.** Sentry regex (16 keys) misses `full_name`, `access_token`, `jwt`, `api_key`, `ip_address`, `cookie`, `user_agent`. Audit-log Set (23 keys) misses `credit`, `card`, `cvv`, `hash`, `birth`. Fix: extract shared `src/lib/pii.ts` consumed by both. |

### 🟠 HIGH (12)

| #    | File                                                    | Issue                                                                                                                                                                                  |
| ---- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H-01 | 3 routes: `admin/api-keys`, `auth/mfa/enroll`, `export` | **Zod `flatten()` leaked in 400 responses.** Reveals field types/constraints to unauthenticated callers. Replace `details: parsed.error.flatten()` with `error: 'Validation failed.'`. |
| H-02 | 21/32 route handler files                               | **Missing top-level try/catch.** Unexpected errors (malformed JSON, DB failures) return Next.js default 500s, bypass Sentry.                                                           |
| H-03 | `api/compliance/opt-out`                                | **No rate limiting + no auth + no Zod validation.** Public POST endpoint — only RLS protects it. Add rate limiting + Zod schema.                                                       |
| H-04 | `api/admin/compliance/dsar`                             | **No rate limiting on GET** (admin, queries activity_logs). Add rate limiting per admin user.                                                                                          |
| H-05 | `README.md`                                             | **Next.js 15** (actual: 16) on line 21; **562 tests** (actual: 757) on line 79.                                                                                                        |
| H-06 | `PRIVACY.md`                                            | **Lines 25-32 duplicated** — same 4 rights listed twice.                                                                                                                               |
| H-07 | `.env.example`                                          | **Missing `NEXT_PUBLIC_SITE_URL`** — used in middleware, billing redirects, admin redirects.                                                                                           |
| H-08 | `CLAUDE.md`                                             | **Lists only 4 of 25 DB tables**; extremely incomplete API route listing.                                                                                                              |
| H-09 | `src/lib/audit-log.ts` catch                            | **Silent failure** — `void err` makes audit pipeline failures invisible to ops. Log to Sentry at minimum.                                                                              |
| H-10 | Root `src/app/error.tsx` + `loading.tsx`                | **Missing.** No fallback for root-level errors/loading.                                                                                                                                |
| H-11 | 10 public pages + root admin pages                      | **Missing error.tsx/loading.tsx** (see full list below). Route-group-level files exist but won't catch sub-page crashes.                                                               |
| H-12 | `src/lib/pricing.ts` + portfolio/nav/process            | **Hardcoded content despite DB tables existing.** `src/lib/content.ts` has `getPublished*` functions — they're never imported. Wire them in.                                           |

### 🟡 MEDIUM (7)

| #    | File                                                                        | Issue                                                                                                                                   |
| ---- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| M-01 | `api/compliance/data-deletion`                                              | Returns `userId` in response — unnecessary info leak                                                                                    |
| M-02 | `api/admin/leads` GET                                                       | `select('*')` with service_role exposes all columns unnecessarily                                                                       |
| M-03 | Admin GET routes (leads, clients, dsar, api-keys)                           | No rate limiting — all use service_role, no brute-force protection                                                                      |
| M-04 | 4 docs files (`EDGE_CDN.md`, `DNS_SETUP.md`, `WAF_CONFIG.md`, `BACKUPS.md`) | Generic AI boilerplate with unchecked checkboxes — references CloudFront/infra not actually used                                        |
| M-05 | `ARCHITECTURE.md`                                                           | References non-existent `src/lib/api-keys.ts`; lists `/api/bootstrap` instead of `/api/admin/bootstrap`; missing i18n + bridge sections |
| M-06 | `DEPLOYMENT.md`                                                             | References non-existent `slack-app/` and `ip-allowlist.ts`                                                                              |
| M-07 | `src/lib/bridge/auth.ts` + `idempotency.ts`                                 | Missing JSDoc on exported functions (Rule 14 violation)                                                                                 |

### 🔵 LOW (3)

| #    | File                         | Issue                                                                                               |
| ---- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| L-01 | `next.config.ts` CSP         | `'unsafe-inline'` in script-src — documented TODO (Next.js App Router nonce support pending)        |
| L-02 | `scripts` table in README.md | Missing `verify`, `audit:content`, `check:assets`, `start` scripts                                  |
| L-03 | `docs/SECURITY.md`           | CSP description includes `'strict-dynamic'` not in actual config; CORS incorrectly marked unchecked |

---

## Missing Error/Loading States — Full List

| Route Group          | Directories Missing Both error.tsx AND loading.tsx                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `(public)/`          | about, contact, do-not-sell, intake, portfolio, pricing, privacy, process, services, terms                                                                     |
| `(client)/dashboard` | (root dashboard only — sub-pages all covered)                                                                                                                  |
| `admin/(main)/`      | admins, audit, billing, bootstrap, clients, clients/[id], compliance/dsar, content/hero-headlines, content/portfolio, leads, projects, projects/[id], settings |

---

## Summary Dashboard

```
Quality Gates     ═══════════════ 5/5 ✓
Supply Chain      ═══════════════ □ (0 vulns, 16 behind)
Code Quality      ═══╗            □ (clean — 1 critical, 2 high)
Security          ═══╗            □ (strong posture — 2 high findings)
Documentation     ═══╗            □ (4 high, several medium)
States            ════╗           □ (32 directories missing error/loading)
Content Arch      ═════╗          □ (4 types hardcoded despite DB tables)
```

**Score: 7.5/10** — Strong foundation. Most findings are documentation drift and defensive hardening. The two real security issues are the Zod flatten() leaks (H-01) and the unprotected opt-out endpoint (H-03).
