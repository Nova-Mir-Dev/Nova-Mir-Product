# Implementation Plan: MFA Enforcement on Login

## Overview

After password login, if a user has verified MFA factors (TOTP or WebAuthn), redirect to a challenge page. The user must complete MFA before reaching the dashboard. Applies to both admin and client portals.

## Architecture Decisions

- **Session handling:** Login action redirects to `/admin/auth/mfa` (or `/clients/auth/mfa`) when factors exist. Challenge page uses existing `verifyMfa()` server action. After successful MFA, redirect to original destination.
- **No middleware changes:** MFA check happens in the login action, not middleware. The challenge page checks that the user has an active session but doesn't require MFA yet.
- **Reuse existing actions:** `listMfaFactors()` and `verifyMfa()` already exist in `src/features/auth/mfa.ts`.

## Task List

### Task 1: MFA Challenge Component
**Description:** Create a shared client component `MfaChallenge` that handles TOTP code entry and WebAuthn passkey challenge. Renders a code input for TOTP or triggers browser WebAuthn prompt for passkeys.

**Acceptance criteria:**
- [ ] Shows list of enrolled factors (TOTP, passkey)
- [ ] TOTP: code input + "Verify" button
- [ ] WebAuthn: "Use Passkey" button that triggers `navigator.credentials.get()`
- [ ] Error state for wrong codes
- [ ] Loading state during verification

**Files:**
- `src/features/auth/components/mfa-challenge.tsx` (NEW)
- `src/features/auth/mfa-challenge.module.css` (NEW)

**Estimated scope:** Medium (3-4 files)

### Task 2: Admin MFA Challenge Page
**Description:** Create `/admin/auth/mfa` page that reads the session, lists factors, and renders MfaChallenge. After successful verification, redirects to `/admin`.

**Acceptance criteria:**
- [ ] Authenticated users with MFA factors see the challenge
- [ ] Unauthenticated users get redirected to login
- [ ] Successful MFA redirects to admin dashboard
- [ ] Matching visual style (Azimuth Card, centered layout)

**Files:**
- `src/app/admin/auth/mfa/page.tsx` (NEW)

**Estimated scope:** Small (1 file)

### Task 3: Client MFA Challenge Page
**Description:** Create `/clients/auth/mfa` page — same as Task 2 but for client portal.

**Acceptance criteria:**
- [ ] Same behavior as admin MFA page
- [ ] Redirects to client dashboard after success

**Files:**
- `src/app/clients/auth/mfa/page.tsx` (NEW)

**Estimated scope:** Small (1 file)

### Task 4: Update Login Actions to Redirect When MFA Factors Exist
**Description:** After `signInWithPassword()` succeeds in the login actions, call `listMfaFactors()`. If verified factors exist, redirect to `/admin/auth/mfa` (or `/clients/auth/mfa`) instead of `/admin` (or `/dashboard`).

**Acceptance criteria:**
- [ ] Admin login: redirects to `/admin/auth/mfa` when factors exist
- [ ] Client login: redirects to `/clients/auth/mfa` when factors exist
- [ ] No MFA factors: proceeds to dashboard as before
- [ ] Unverified (pending) factors don't trigger challenge

**Files:**
- `src/features/auth/actions/index.ts` (admin login action)
- `src/app/(client)/dashboard/support/actions.ts` — check if client login exists elsewhere

**Estimated scope:** Small (1-2 files)

### Checkpoint: End-to-End
- [ ] All tasks compile (`npm run typecheck`)
- [ ] Enroll TOTP → log out → log in → see challenge → enter code → reach dashboard
- [ ] No MFA → login unchanged
- [ ] Wrong code → error message, stay on challenge

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `mfa.verify()` doesn't upgrade SSR session cookies to AAL2 | High — challenge succeeds but middleware might not reflect the upgraded session | Implement first, test on production. If broken, add cookie-based `mfa_completed` flag in the verify action. |
| WebAuthn challenge flow doesn't work in the browser | Medium — user can't use passkey to complete login | Make TOTP the primary path. WebAuthn challenge as secondary. |
| Login action already sets session cookies before MFA check | Medium — user could bypass by navigating directly to dashboard | The challenge page checks factors and redirects back. Risk is low since the admin dashboard also does a role check. |

## Open Questions
- (Resolved by "implement and test") Does `mfa.verify()` upgrade SSR cookies to AAL2?
