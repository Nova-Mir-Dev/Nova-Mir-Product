# Audit Report: Supply Chain & States

**Date**: 2026-06-25
**Scope**: Supply chain audit, error/loading state coverage, content architecture compliance

---

## 1. Supply Chain Audit

### Vulnerabilities

```
npm audit: 0 vulnerabilities found
```

**PASS** — No known vulnerabilities in the dependency tree.

### Outdated Dependencies

| Package                   | Current | Wanted  | Latest  | Gap   |
| ------------------------- | ------- | ------- | ------- | ----- |
| @sentry/nextjs            | 10.56.0 | 10.61.0 | 10.61.0 | minor |
| @supabase/ssr             | 0.10.3  | 0.10.3  | 0.12.0  | minor |
| @supabase/supabase-js     | 2.108.0 | 2.108.2 | 2.108.2 | patch |
| @types/node               | 25.9.2  | 25.9.4  | 26.0.1  | major |
| eslint                    | 10.4.1  | 10.5.0  | 10.5.0  | minor |
| eslint-config-next        | 16.2.7  | 16.2.9  | 16.2.9  | patch |
| next                      | 16.2.7  | 16.2.9  | 16.2.9  | patch |
| prettier                  | 3.8.3   | 3.8.4   | 3.8.4   | patch |
| recharts                  | 3.8.1   | 3.9.0   | 3.9.0   | minor |
| resend                    | 4.8.0   | 4.8.0   | 6.14.0  | major |
| stripe                    | 17.7.0  | 17.7.0  | 22.3.0  | major |
| twilio                    | 5.13.1  | 5.13.1  | 6.0.2   | major |
| typescript-eslint         | 8.61.0  | 8.62.0  | 8.62.0  | minor |
| vitest                    | 4.1.8   | 4.1.9   | 4.1.9   | patch |
| @vitest/coverage-istanbul | 4.1.8   | 4.1.9   | 4.1.9   | patch |

**Notable**: `next` and `eslint-config-next` are 2 patches behind. `resend` (major: 4.8.0 → 6.14.0), `stripe` (major: 17.7.0 → 22.3.0), and `twilio` (major: 5.13.1 → 6.0.2) are significantly behind — consider upgrade planning.

**Key pinned versions**:

- `next`: `^16.2.7`
- `react`: `^19.2.7`
- `azimuth-ui`: `^0.8.0`

---

## 2. Error / Loading State Coverage

### Root-Level States

| File                       | Status      |
| -------------------------- | ----------- |
| `src/app/error.tsx`        | **MISSING** |
| `src/app/loading.tsx`      | **MISSING** |
| `src/app/global-error.tsx` | EXISTS      |

### (public) Route Group — Layout-level states exist, sub-pages all missing

| Directory                    | error.tsx   | loading.tsx |
| ---------------------------- | ----------- | ----------- |
| src/app/(public)             | EXISTS      | EXISTS      |
| src/app/(public)/about       | **MISSING** | **MISSING** |
| src/app/(public)/contact     | **MISSING** | **MISSING** |
| src/app/(public)/do-not-sell | **MISSING** | **MISSING** |
| src/app/(public)/intake      | **MISSING** | **MISSING** |
| src/app/(public)/portfolio   | **MISSING** | **MISSING** |
| src/app/(public)/pricing     | **MISSING** | **MISSING** |
| src/app/(public)/privacy     | **MISSING** | **MISSING** |
| src/app/(public)/process     | **MISSING** | **MISSING** |
| src/app/(public)/services    | **MISSING** | **MISSING** |
| src/app/(public)/terms       | **MISSING** | **MISSING** |

### (client)/dashboard — Root dashboard missing; all sub-pages covered

| Directory                                | error.tsx   | loading.tsx |
| ---------------------------------------- | ----------- | ----------- |
| src/app/(client)/dashboard               | **MISSING** | **MISSING** |
| src/app/(client)/dashboard/analytics     | EXISTS      | EXISTS      |
| src/app/(client)/dashboard/billing       | EXISTS      | EXISTS      |
| src/app/(client)/dashboard/contact       | EXISTS      | EXISTS      |
| src/app/(client)/dashboard/documents     | EXISTS      | EXISTS      |
| src/app/(client)/dashboard/privacy       | EXISTS      | EXISTS      |
| src/app/(client)/dashboard/projects      | EXISTS      | EXISTS      |
| src/app/(client)/dashboard/projects/[id] | EXISTS      | EXISTS      |
| src/app/(client)/dashboard/settings      | EXISTS      | EXISTS      |
| src/app/(client)/dashboard/status        | EXISTS      | EXISTS      |
| src/app/(client)/dashboard/support       | EXISTS      | EXISTS      |

### admin — Only group-layout covered; all sub-pages missing

| Directory                                   | error.tsx   | loading.tsx |
| ------------------------------------------- | ----------- | ----------- |
| src/app/admin/(main)                        | EXISTS      | EXISTS      |
| src/app/admin/(main)/admins                 | **MISSING** | **MISSING** |
| src/app/admin/(main)/audit                  | **MISSING** | **MISSING** |
| src/app/admin/(main)/billing                | **MISSING** | **MISSING** |
| src/app/admin/(main)/bootstrap              | **MISSING** | **MISSING** |
| src/app/admin/(main)/clients                | **MISSING** | **MISSING** |
| src/app/admin/(main)/clients/[id]           | **MISSING** | **MISSING** |
| src/app/admin/(main)/compliance/dsar        | **MISSING** | **MISSING** |
| src/app/admin/(main)/content/hero-headlines | **MISSING** | **MISSING** |
| src/app/admin/(main)/content/portfolio      | **MISSING** | **MISSING** |
| src/app/admin/(main)/leads                  | **MISSING** | **MISSING** |
| src/app/admin/(main)/monitoring             | **MISSING** | **MISSING** |
| src/app/admin/(main)/projects               | **MISSING** | **MISSING** |
| src/app/admin/(main)/projects/[id]          | **MISSING** | **MISSING** |
| src/app/admin/(main)/revenue                | **MISSING** | **MISSING** |
| src/app/admin/(main)/settings               | **MISSING** | **MISSING** |
| src/app/admin/auth/login                    | EXISTS      | EXISTS      |

### clients/auth

| Directory                        | error.tsx   | loading.tsx |
| -------------------------------- | ----------- | ----------- |
| src/app/clients/auth/check-email | **MISSING** | EXISTS      |
| src/app/clients/auth/login       | **MISSING** | EXISTS      |

### setup

| Directory     | error.tsx | loading.tsx |
| ------------- | --------- | ----------- |
| src/app/setup | EXISTS    | EXISTS      |

### Summary: Missing States

- **32 directories missing error.tsx**
- **32 directories missing loading.tsx**
- `src/app/error.tsx` and `src/app/loading.tsx` (root level) also missing

---

## 3. Content Architecture Compliance

**Rule**: Content that is frequently updated or grows over time MUST live in database tables with admin CRUD, not hardcoded in source files.

### Pricing Tiers — FAIL (hardcoded)

| Item       | Finding                                                                              |
| ---------- | ------------------------------------------------------------------------------------ |
| Source     | `src/lib/pricing.ts:31-74` — 44 lines of hardcoded tier objects                      |
| DB table   | `pricing_tiers` EXISTS (schema.sql:447-470, seeded)                                  |
| DB query   | `getPublishedPricing` in `src/lib/content.ts:29-39` exists but is **never imported** |
| Admin CRUD | **MISSING** — no route at `src/app/api/admin/content/pricing/`                       |

### Portfolio Projects — FAIL (hardcoded in pages, despite having full admin CRUD)

| Item       | Finding                                                                                |
| ---------- | -------------------------------------------------------------------------------------- |
| Source     | `src/app/(public)/portfolio/page.tsx:5-12` and `src/app/(public)/page.tsx:50-56`       |
| DB table   | `portfolio_projects` EXISTS (schema.sql:475-502, seeded)                               |
| DB query   | `getPublishedPortfolio` in `src/lib/content.ts:41-51` exists but is **never imported** |
| Admin CRUD | **EXISTS** — `src/app/api/admin/content/portfolio/route.ts` (full CRUD)                |
| Admin UI   | **EXISTS** — `src/features/admin/portfolio/portfolio-page.tsx` (373 lines)             |

### Public Nav Links — FAIL (hardcoded)

| Item       | Finding                                                                               |
| ---------- | ------------------------------------------------------------------------------------- |
| Source     | `src/lib/navigation.ts:12-19` — 6 hardcoded nav items                                 |
| DB table   | `public_nav_links` EXISTS (schema.sql:507-526, seeded with 9 rows)                    |
| DB query   | `getPublishedNavLinks` in `src/lib/content.ts:53-64` exists but is **never imported** |
| Admin CRUD | **MISSING** — no route at `src/app/api/admin/content/nav-links/`                      |

### Hero Headlines — PASS (fully DB-backed)

| Item         | Finding                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------- |
| Client fetch | `src/app/(public)/_components/hero-headlines.tsx:22` fetches from `/api/content/hero-headlines` |
| DB table     | `hero_headlines` EXISTS (schema.sql:528-556, seeded with 9 rows)                                |
| Public API   | `src/app/api/content/hero-headlines/route.ts`                                                   |
| Admin CRUD   | **EXISTS** — `src/app/api/admin/content/hero-headlines/route.ts`                                |
| Admin UI     | **EXISTS** — `src/features/admin/hero-headlines/hero-headlines-page.tsx`                        |

### Testimonials — N/A (deferred by design)

No hardcoded testimonial data. DB table exists but is marked as intentionally deferred (no seed data, no admin CRUD yet). Acceptable.

### Process Steps — FAIL (hardcoded)

| Item       | Finding                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------- |
| Source     | `src/app/(public)/page.tsx:29-48` (3 steps) and `src/app/(public)/process/page.tsx:5-24` (3 steps) |
| DB table   | `process_steps` EXISTS (schema.sql:583-605) but **marked deferred**                                |
| DB query   | **MISSING** — no `getPublishedProcessSteps` in `src/lib/content.ts`                                |
| Admin CRUD | **MISSING** — no route at `src/app/api/admin/content/process-steps/`                               |

### Content Architecture Summary

| Content Type       | Status         | DB Table          | Admin CRUD | Hardcoded Source                  |
| ------------------ | -------------- | ----------------- | ---------- | --------------------------------- |
| Pricing tiers      | **FAIL**       | EXISTS            | MISSING    | `src/lib/pricing.ts` (44 lines)   |
| Portfolio projects | **FAIL**       | EXISTS            | EXISTS     | `page.tsx` files (15 lines)       |
| Public nav links   | **FAIL**       | EXISTS            | MISSING    | `src/lib/navigation.ts` (8 lines) |
| Hero headlines     | **PASS**       | EXISTS            | EXISTS     | none                              |
| Testimonials       | N/A (deferred) | EXISTS            | MISSING    | none                              |
| Process steps      | **FAIL**       | EXISTS (deferred) | MISSING    | `page.tsx` files (40 lines)       |

---

## Priority Recommendations

1. **Critical**: Add `error.tsx` and `loading.tsx` to all 32 missing directories (especially public pages that are user-facing)
2. **High**: Migrate pricing tiers from hardcoded `src/lib/pricing.ts` to DB-backed (DB table and query function already exist)
3. **High**: Wire public nav links from DB instead of hardcoded `src/lib/navigation.ts` (DB table and query function already exist)
4. **Medium**: Wire portfolio pages to use DB queries instead of hardcoded arrays (admin CRUD already exists)
5. **Medium**: Create process steps admin CRUD and wire pages to DB
6. **Low**: Upgrade `stripe`, `resend`, and `twilio` to latest major versions
7. **Low**: Add root `src/app/error.tsx` and `src/app/loading.tsx`
