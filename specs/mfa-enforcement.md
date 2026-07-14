# Spec: MFA Enforcement on Login

## Objective

When a user has verified MFA factors (TOTP or WebAuthn) enrolled, they should be challenged to complete MFA before accessing protected routes. Currently, MFA factors can be enrolled but have zero effect on login — the user proceeds straight to the dashboard after password auth.

Success: a user with MFA enrolled is redirected to a challenge page after password login, must complete TOTP/WebAuthn verification, and only then reaches the dashboard. A user without MFA factors sees no change.

## Commands

```bash
Build:    npm run build
Type:     npm run typecheck
Dev:      npm run dev
Test:     npm test
Lint:     npm run lint
Test MFA: # Manual: enroll TOTP, log out, log back in — verify challenge prompt
```

## Project Structure

```
src/features/auth/
  mfa.ts            → Server actions (enroll, verify, challenge, list factors)
  mfa-panel.tsx     → Client component for MFA enrollment UI
  mfa-panel.module.css

src/features/auth/components/
  mfa-challenge.tsx → NEW: Client component for MFA challenge on login

src/app/admin/auth/
  login/
    page.tsx        → Existing login page
  mfa/
    page.tsx        → NEW: MFA challenge page (TOTP code entry / passkey prompt)

middleware.ts       → Updated: check AAL for protected routes
```

## Tech Stack

- Supabase SSR (`@supabase/ssr`) for session management
- Supabase Auth MFA API (`supabase.auth.mfa.*`)
- Azimuth UI (Card, Input, Button, Stack, Text)
- Next.js 16 App Router

## Code Style

Follow existing patterns: server actions in `'use server'` files, client components with `'use client'`, Azimuth components for UI.

```tsx
// Server action pattern (existing)
export async function challengeMfa(userId: string) {
  const supabase = await createClient()
  // ...
}
```

## Testing Strategy

- Manual testing only (MFA flow is heavily dependent on Supabase backend):
  1. Enroll TOTP in settings
  2. Log out
  3. Log back in — should see MFA challenge
  4. Enter wrong code — should show error
  5. Enter correct code — should proceed to dashboard
  6. Revoke TOTP — login should skip challenge

## Flow

```
1. [login] POST /admin/auth/login
   ├── signInWithPassword() succeeds
   ├── listMfaFactors() → check for verified factors
   ├── if factors exist → redirect to /admin/auth/mfa
   └── if no factors → redirect to /admin (as now)

2. [challenge] GET /admin/auth/mfa
   ├── Reads session from cookies
   ├── Lists factors, shows TOTP code input
   └── User enters code

3. [verify] POST /admin/auth/mfa (via form action)
   ├── challenge() + verify()
   ├── on success → redirect to /admin
   └── on failure → show error, stay on challenge page

4. Middleware: no change needed
   ├── Login action handles the redirect to challenge
   └── Challenge page only visible to authenticated users
```

**Key design decision:** We do NOT use middleware for MFA enforcement. Instead, the login action itself redirects to the challenge page when factors exist. The challenge page verifies the user is authenticated (has session) but not yet fully authorized. After MFA, the session is the same — Supabase MFA doesn't create a new session, it just marks the existing one as AAL2.

Wait — this is actually the critical question. Does Supabase `mfa.verify()` upgrade the session AAL within the existing SSR session? Or does it just return success without changing anything?

Looking at Supabase docs:

- `mfa.challenge()` creates a challenge for a factor
- `mfa.verify()` verifies the challenge with a code
- After successful verification, the current session's AAL is upgraded from aal1 to aal2

But in SSR mode, the session is stored in cookies. The `mfa.verify()` call on the server should upgrade the session's AAL, which will be reflected in subsequent `getUser()` calls.

So the flow would be:

1. Login → signInWithPassword → session created (AAL1)
2. Check factors → if present, redirect to challenge
3. Challenge page → enters code → server calls challenge + verify
4. Session upgraded to AAL2
5. Redirect to dashboard
6. Middleware checks AAL → allows through

## Boundaries

**Always do:**

- Check for verified MFA factors after every password login
- Show clear error messages on failed challenge
- Allow retry on wrong code
- Redirect to original destination after MFA

**Ask first before:**

- Adding "remember this device" (skip MFA for N days)
- Supporting phone/SMS MFA (not currently in scope)
- WebAuthn challenge flow (TOTP first, passkey as follow-up)

**Never do:**

- Store MFA codes or secrets in cookies/localStorage
- Skip MFA for any authenticated session with verified factors
- Reveal whether a user has MFA enrolled (enumeration attack)

## Success Criteria

- [ ] User with no MFA factors: login unchanged (straight to dashboard)
- [ ] User with TOTP enrolled: redirected to `/admin/auth/mfa` after password login
- [ ] Challenge page shows TOTP code input
- [ ] Wrong code shows error, allows retry
- [ ] Correct code redirects to dashboard
- [ ] Client portal login has the same behavior

## Open Questions

1. **Session AAL handling:** Does `mfa.verify()` in a server action actually upgrade the SSR session cookies? Or do we need to set additional cookies ourselves?

2. **WebAuthn challenge:** Should the first pass support WebAuthn challenge too, or just TOTP? (The enrollment UI already supports both.)

3. **Client portal:** Same flow for `/clients/auth/login`? Yes, but starting with admin only.
