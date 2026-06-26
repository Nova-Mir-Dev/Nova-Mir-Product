# Documentation Audit Report

**Date:** 2026-06-25
**Scope:** All documentation files, `.env.example`, JSDoc, and code-level documentation
**Auditor:** docs-audit agent

---

## 1. README.md

**Path:** `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/README.md`

### Findings

| Severity   | Finding                                                                                                                                                                                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HIGH**   | **Next.js version mismatch**: Line 21 says "Next.js 15 (App Router)" but `package.json` declares `"next": "^16.2.7"`. Should read **Next.js 16**.                                                                                                                                                                                                                   |
| **HIGH**   | **Stale test count**: Line 79 claims "562 tests across 56 test files". Actual count as of this audit run: **757 tests across 84 test files**. This number should either be removed (it will drift again) or dynamically generated.                                                                                                                                  |
| **MEDIUM** | **Missing scripts in table**: The scripts table (lines 44-52) omits `npm run verify`, `npm run audit:content`, `npm run check:assets`, and `npm run start`, all of which exist in `package.json`.                                                                                                                                                                   |
| **MEDIUM** | **Missing env vars in table**: The env vars table (lines 56-70) does not document `REVALIDATION_SECRET`, `ALLOWED_IPS`, `SLACK_LEADS_CHANNEL`, `SENTRY_DSN` (non-public version), `DATABASE_URL`, or pricing env vars (`NEXT_PUBLIC_TIER1_NAME`, etc.). It says "See `.env.example` for the full list" which partially mitigates this, but the table is incomplete. |
| **LOW**    | The README architecture tree references `src/lib/slack.ts` but doesn't mention the existence of other important lib files (`bridge/`, `content.ts`, `api-error.ts`, `cors.ts`, `in-app-notifications.ts`, `stripe.ts`, `cookie-consent.ts`).                                                                                                                        |

### Verdict: Needs updating (3 high findings)

---

## 2. CONTRIBUTING.md

**Path:** `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/CONTRIBUTING.md`

### Findings

| Severity | Finding                                                                                               |
| -------- | ----------------------------------------------------------------------------------------------------- |
| INFO     | Covers contribution workflow, branch strategy, PR process, quality gates, commit message conventions. |

### Verdict: No issues found. Accurate and current.

---

## 3. LICENSE

**Path:** `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/LICENSE`

### Findings

- **MIT License**, copyright (c) 2026 Nova Mir. Valid and standard.

### Verdict: No issues found.

---

## 4. ARCHITECTURE.md

**Path:** `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/docs/ARCHITECTURE.md`

### Findings

| Severity   | Finding                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **HIGH**   | **Mentions non-existent file**: Line 31 lists `src/lib/api-keys.ts` but this file does not exist. API key handling is in `src/lib/bridge/auth.ts`.                                                                                                                                                                                                                                                     |
| **MEDIUM** | **API route table incomplete**: The table (lines 137-155) claims to list all API routes but is missing several: `admin/clients/invite`, `admin/content/portfolio`, `admin/bootstrap` (listed as just `/api/bootstrap` on line 149 but actual path is `/api/admin/bootstrap`), `documents`, `export`, `revalidate`, `content/hero-headlines`. Line 81 says "29 routes" but the table has fewer entries. |
| **MEDIUM** | **Route path error**: Line 149 lists `/api/bootstrap` but the actual route is `/api/admin/bootstrap` (correct on line 89 in the directory tree, but wrong in the table).                                                                                                                                                                                                                               |
| **MEDIUM** | **No mention of i18n infrastructure**: The app uses `next-intl` with `i18n/request.ts` and `messages/en.json`/`es.json`. Not mentioned anywhere in ARCHITECTURE.md.                                                                                                                                                                                                                                    |
| **MEDIUM** | **No mention of Bridge API primitives**: `src/lib/bridge/auth.ts`, `idempotency.ts`, `types.ts` exist but are undocumented.                                                                                                                                                                                                                                                                            |
| **LOW**    | Line 32: `rate-limit.ts` described as "in-memory; Redis-ready" but the actual code uses Upstash Redis with an in-memory **fallback** (more accurate description: "Upstash Redis with in-memory fallback"). The README already describes it correctly.                                                                                                                                                  |
| **LOW**    | Line 167 says "25 tables" which is consistent with AGENTS.md's list of 25 table names.                                                                                                                                                                                                                                                                                                                 |
| **LOW**    | No mention of `sentry.server.config.ts`, `sentry.edge.config.ts`, or `instrumentation.ts`.                                                                                                                                                                                                                                                                                                             |

### Required Checks (from scope):

| Required mention          | Found? | Evidence                                                                                     |
| ------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| Next.js 16                | YES    | Line 5                                                                                       |
| Supabase SSR auth         | YES    | Line 8                                                                                       |
| RLS security model        | YES    | Lines 27-28 (ANON key respects RLS), Line 161 (service role bypasses RLS)                    |
| Sentry with PII scrubbing | YES    | Line 15 mentions Sentry (PII scrubbing is in code and mentioned in middleware flow contexts) |
| audit_logs table          | YES    | Line 33                                                                                      |
| i18n infrastructure       | **NO** | Missing entirely                                                                             |
| Bridge API primitives     | **NO** | Missing entirely                                                                             |

### Verdict: Needs updating (2 high, 4 medium findings)

---

## 5. DEPLOYMENT.md

**Path:** `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/docs/DEPLOYMENT.md`

### Findings

| Severity   | Finding                                                                                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MEDIUM** | **References non-existent directories**: Line 39 references `slack-app/` standalone directory which does not exist in the repo. Line 143 references `ip-allowlist.ts` which does not exist.  |
| **MEDIUM** | **Broken/missing content**: Line 85 ends with an incomplete bullet: "- [ ] Verify tables created: `users`, `audit_logs`, `api_keys`, `appointments`," — trailing comma with no completion.   |
| **LOW**    | **Template boilerplate**: The checklist format with unchecked boxes suggests this is generated/boilerplate content. Some sections (e.g., DNS setup) duplicate what's in `docs/DNS_SETUP.md`. |
| **LOW**    | Cross-references to `docs/SECURITY.md` on line 146, which exists. Cross-references to `docs/COMPLIANCE.md` on line 117, which exists.                                                        |

### Verdict: Needs fixing (2 medium findings)

---

## 6. COMPLIANCE.md

**Path:** `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/docs/COMPLIANCE.md`

### Findings

| Severity | Finding                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| INFO     | Covers DSAR process for all target markets (ca, us, eu, uk, mx, au). References Plausible, 90-day retention. |
| INFO     | Mentions applicable regulations and key requirements, consistent with the rest of the docs.                  |

### Verdict: No issues found.

---

## 7. PRIVACY.md

**Path:** `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/docs/PRIVACY.md`

### Findings

| Severity | Finding                                                                                                                                                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HIGH** | **Duplicate content**: Lines 25-32 are identical duplicates. The same 4 bullet points ("Access, rectify, or delete your data; Data portability; Restrict or object to processing; Withdraw consent at any time") appear twice in a row. |
| LOW      | The document covers a comprehensive set of rights for GDPR, UK GDPR, CCPA/CPRA, PIPEDA, and LFPDPPP. Contact emails `dpo@novamir.dev` and `privacy@novamir.dev`.                                                                        |

### Verdict: Needs fixing (1 high finding)

---

## 8. AGENTS.md

**Path:** `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/AGENTS.md`

### Findings

| Severity   | Finding                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **MEDIUM** | **Missing API route**: The API route list (lines 163-190) does not include `POST /api/admin/clients/invite` which exists at `src/app/api/admin/clients/invite/route.ts`. |
| LOW        | Database tables list (lines 135-159) lists 25 tables. Schema.sql has all of these. Appears accurate.                                                                     |
| LOW        | API routes list has 29 entries (lines 163-190) which matches the 29 routes mentioned in ARCHITECTURE.md.                                                                 |
| INFO       | Directory structure overview is accurate. Content architecture rule is correct and matches codebase.                                                                     |
| INFO       | Quality gates, brand voice references, beads integration, session completion — all correct.                                                                              |

### Verdict: Minor fix needed (1 medium finding)

---

## 9. Other Documentation Files (not in primary scope but reviewed)

### CLAUDE.md (`/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/CLAUDE.md`)

| Severity | Finding                                                                                                                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HIGH** | **Incomplete database table listing**: Lines 86-87 list only 4 tables (`users, audit_logs, api_keys, appointments`) but there are 25 tables. Very misleading.                                   |
| **HIGH** | **Incomplete API route listing**: Line 87 lists a tiny subset of routes. Omits all the admin content routes, compliance routes, leads, documents, export, notifications, revalidate, crud, etc. |
| MEDIUM   | Lines 57-58 have good high-level description, but the technical details in 86-87 are dangerously incomplete.                                                                                    |

### docs/SECURITY.md (`/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/docs/SECURITY.md`)

| Severity | Finding                                                                                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MEDIUM   | Line 15: CORS check is unchecked but CORS **is** configured in `middleware.ts` and `src/lib/cors.ts` (verified).                                                                                         |
| MEDIUM   | Line 23: says CSP includes `'strict-dynamic'` but the actual CSP in `next.config.ts` does NOT include `'strict-dynamic'`. It has `'unsafe-inline'` instead (with a TODO comment about moving to nonces). |
| NOTE     | Two `SECURITY.md` files exist — one at root (vulnerability reporting policy) and one in `docs/` (security baseline). Both are valid, but the root one is the standard GitHub security policy location.   |

### Boilerplate template docs (not project-specific):

| File                       | Verdict                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `docs/EDGE_CDN.md`         | Generic boilerplate. References CloudFront (not used — app is on Vercel). All checkboxes unchecked. Not project-specific. |
| `docs/DNS_SETUP.md`        | Generic DNS checklist. No project-specific details (no actual domain records).                                            |
| `docs/REGION.md`           | Very thin — just says `us-east-1`. All boilerplate.                                                                       |
| `docs/WAF_CONFIG.md`       | All items unchecked. Generic WAF checklist. Not project-specific.                                                         |
| `docs/SECURITY_HEADERS.md` | Partially useful (documents actual headers) but the CSP description at line 11 doesn't match actual config.               |
| `docs/BACKUPS.md`          | Mentions Supabase PITR but all items unchecked. Needs project-specific detail.                                            |
| `docs/DATA_RETENTION.md`   | Reasonable but brief. Consistent with COMPLIANCE.md.                                                                      |

These 5-6 files appear to be **Project Bootstrapper template output** rather than hand-crafted project documentation. They contain unchecked checkboxes and generic guidance.

---

## 10. .env.example

**Path:** `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/.env.example`

### Findings

| Severity | Finding                                                                                                                                                                                             |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HIGH** | **Missing required env var**: `NEXT_PUBLIC_SITE_URL` is used in 5+ files (middleware.ts, billing actions, setup actions, admins actions, bootstrapper) but is NOT documented in `.env.example`.     |
| MEDIUM   | `DATABASE_URL` is documented but it's unclear if this is actually required by the app (supabase-js uses URL + anon key, not a direct PG connection string). Check if any migration scripts need it. |
| MEDIUM   | `SENTRY_DSN` (non-public) is documented alongside `NEXT_PUBLIC_SENTRY_DSN`. `sentry.client.config.ts` only uses `NEXT_PUBLIC_SENTRY_DSN`. Verify `SENTRY_DSN` is actually consumed somewhere.       |
| LOW      | Pricing vars exist and are verified as consumed by `src/lib/pricing.ts`. Good.                                                                                                                      |
| LOW      | `ALLOWED_IPS` exists but no code actually reads it (DEPLOYMENT.md references `ip-allowlist.ts` which doesn't exist). Might be dead config.                                                          |

### Verdict: Needs updating (1 high finding)

---

## 11. JSDoc Audit

### Required files from scope:

| File                                                                   | JSDoc Status                                                                                                                            |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/sentry-scrub.ts` — `scrubPii`                                 | **PASS** — Has JSDoc (lines 7-14)                                                                                                       |
| `src/lib/audit-log.ts` — `logAudit`                                    | **PASS** — Has JSDoc (lines 58-75)                                                                                                      |
| `src/lib/bridge/auth.ts` — `verifyBridgeApiKey`                        | **FAIL** — No JSDoc on exported function                                                                                                |
| `src/lib/bridge/idempotency.ts` — `checkIdempotency`, `markIdempotent` | **FAIL** — No JSDoc on either exported function                                                                                         |
| `src/lib/bridge/types.ts` — exports                                    | **PASS** — Simple interfaces and Zod schema (JSDoc not strictly needed for type-only exports with self-documenting names, but optional) |
| `src/lib/rate-limit.ts` — `rateLimit`                                  | **FAIL** — No JSDoc on the main exported function                                                                                       |

### Additional lib files with exported functions (checked for completeness):

| File                              | Exported Function                                          | JSDoc?                                |
| --------------------------------- | ---------------------------------------------------------- | ------------------------------------- |
| `src/lib/api-error.ts`            | `apiErrorResponse`                                         | **YES**                               |
| `src/lib/content.ts`              | `getPublishedContent`, etc.                                | **NO**                                |
| `src/lib/cors.ts`                 | `getCorsHeaders`, `isAllowedOrigin`, `getCorsOriginHeader` | **NO**                                |
| `src/lib/cookie-consent.ts`       | exports                                                    | **NO**                                |
| `src/lib/in-app-notifications.ts` | exports                                                    | **NO**                                |
| `src/lib/navigation.ts`           | exports                                                    | **NO**                                |
| `src/lib/pricing.ts`              | `getFoundingOfferLabel`, `getMaintenanceRetainer`          | **NO**                                |
| `src/lib/roles.ts`                | `hasPermission`, `requiresMfa`                             | **NO**                                |
| `src/lib/sanitize.ts`             | `sanitizeFilename`                                         | **YES**                               |
| `src/lib/slack.ts`                | exports                                                    | **NO**                                |
| `src/lib/stripe.ts`               | exports                                                    | **NO**                                |
| `src/lib/supabase-server.ts`      | `createClient`, `createAdminClient`                        | Partial (only on `createAdminClient`) |
| `src/lib/supabase-admin.ts`       | `createServiceClient`                                      | **NO**                                |
| `src/lib/supabase.ts`             | exports                                                    | **NO**                                |

### Verdict: JSDoc quality is mixed. Core required files mostly pass. The bridge module is critically missing JSDoc. Overall compliance with "Rule 14" (JSDoc on every new exported function/type) is poor across the lib directory.

---

## 12. AI Slop Assessment

### Files with detectable template/boilerplate characteristics:

| File                       | Assessment                                                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/EDGE_CDN.md`         | **AI Slop** — Generic CloudFront setup instructions for a Vercel-deployed app. All unchecked checkboxes. Not project-specific.                                                              |
| `docs/DNS_SETUP.md`        | **AI Slop** — Generic DNS checklist. No actual domain details.                                                                                                                              |
| `docs/REGION.md`           | **AI Slop** — Single-line boilerplate. "Your application is configured for the us-east-1 region." No project-specific information.                                                          |
| `docs/WAF_CONFIG.md`       | **AI Slop** — All unchecked generic WAF rules.                                                                                                                                              |
| `docs/SECURITY_HEADERS.md` | **Borderline** — Has some actual header values matching next.config.ts but appears partially templated.                                                                                     |
| `docs/BACKUPS.md`          | **Borderline** — Mentions Supabase but all items unchecked. Template-like.                                                                                                                  |
| `README.md` line 79        | **Stale hardcoded value** — "562 tests across 56 test files" — this was likely accurate at one point but is now wrong (757/84). This is classic hardcoded-metric drift, not AI slop per se. |

### Overpromising / unverifiable claims:

- `docs/SECURITY.md` — Has unchecked CORS and other items but the code already implements some of them. The checklist is misleading.
- `docs/DEPLOYMENT.md` — The checklist format with mostly-unchecked items implies incomplete setup, but the app is already deployed.

---

## Summary of Action Items

### Critical (must fix):

1. **README.md**: Update "Next.js 15" to "Next.js 16"
2. **README.md**: Remove or automate the test count (stale: 562/56 vs actual 757/84)
3. **PRIVACY.md**: Remove duplicate lines 25-32
4. **.env.example**: Add `NEXT_PUBLIC_SITE_URL` (used by middleware and multiple actions)
5. **CLAUDE.md**: Update incomplete database table list (4 of 25) and API route list

### Important (should fix):

6. **ARCHITECTURE.md**: Remove reference to non-existent `src/lib/api-keys.ts`
7. **ARCHITECTURE.md**: Fix `/api/bootstrap` path (should be `/api/admin/bootstrap`) in table
8. **ARCHITECTURE.md**: Add i18n infrastructure and bridge API primitives sections
9. **ARCHITECTURE.md**: Complete the API route table to include all 29+ routes
10. **DEPLOYMENT.md**: Fix incomplete bullet (line 85), remove references to non-existent `slack-app/` and `ip-allowlist.ts`
11. **CLAUDE.md**: Expand database table and API route listings to match actual codebase
12. **docs/SECURITY.md**: Fix CSP description (no `'strict-dynamic'` present), correctly mark CORS as checked
13. **src/lib/bridge/**: Add JSDoc to `verifyBridgeApiKey`, `checkIdempotency`, `markIdempotent`
14. **src/lib/rate-limit.ts**: Add JSDoc to `rateLimit`

### Nice-to-have:

15. Remove or rewrite template boilerplate docs (`EDGE_CDN.md`, `DNS_SETUP.md`, `REGION.md`, `WAF_CONFIG.md`, `SECURITY_HEADERS.md`) with actual project-specific content
16. Update README scripts table to include all package.json scripts
17. Update ARCHITECTURE.md `rate-limit.ts` description to match actual implementation (Redis + in-memory fallback)
18. Add JSDoc to remaining lib files without it (content.ts, cors.ts, navigation.ts, pricing.ts, roles.ts, slack.ts, stripe.ts, supabase\*.ts, etc.)

---

## File Existence Checklist

| Required File   | Exists? | Path                                                                     |
| --------------- | ------- | ------------------------------------------------------------------------ |
| README.md       | YES     | `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/README.md`            |
| CONTRIBUTING.md | YES     | `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/CONTRIBUTING.md`      |
| LICENSE         | YES     | `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/LICENSE` (MIT)        |
| ARCHITECTURE.md | YES     | `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/docs/ARCHITECTURE.md` |
| DEPLOYMENT.md   | YES     | `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/docs/DEPLOYMENT.md`   |
| COMPLIANCE.md   | YES     | `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/docs/COMPLIANCE.md`   |
| PRIVACY.md      | YES     | `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/docs/PRIVACY.md`      |
| AGENTS.md       | YES     | `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/AGENTS.md`            |
| .env.example    | YES     | `/Users/rosejas/Projects/nova-mir/Nova-Mir-Product/.env.example`         |

All required documentation files exist.
