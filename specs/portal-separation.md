# Spec: Admin/Client Portal Frontend Separation

## Objective

Split the unified `/login` page and shared portal UI into fully separate frontends for admin and client portals — different URLs, different branding, different layouts, no shared auth UI.

**ASSUMPTIONS:**

1. Auth is managed via Supabase (password for admin, magic link for client)
2. Branding uses CSS custom properties from `azimuth-ui`
3. Middleware already handles role-based routing at the request level
4. We're scoping to frontend UI only — no backend/API changes
5. No existing logo assets — use text/brand name for now

## Current State

| Aspect        | Current                                                        |
| ------------- | -------------------------------------------------------------- |
| Login URL     | `/login` with Admin/Client tabs                                |
| Admin login   | Password auth, tab on shared page, redirects to `/admin`       |
| Client login  | Magic link auth, tab on shared page, redirects to `/dashboard` |
| Admin layout  | Server component, re-verifies auth + role inline               |
| Client layout | Client component, fetches `/api/auth/me`                       |
| Branding      | Both use same `azimuth-ui` tokens, no differentiation          |
| Auth layout   | Minimal pass-through, no branding                              |

## Target State

| Aspect            | Target                                                       |
| ----------------- | ------------------------------------------------------------ |
| Admin login URL   | `/admin/auth/login` — branded admin auth page                |
| Client login URL  | `/clients/auth/login` — branded client auth page             |
| Admin login flow  | Password auth, redirects to `/admin`                         |
| Client login flow | Magic link auth, redirects to `/dashboard`                   |
| Admin branding    | Dark sidebar, monochrome, professional                       |
| Client branding   | Light, friendly, brand-colored                               |
| Auth redirect     | Middleware redirects unauthed users to portal-specific login |
| Check-email       | Move to `/clients/auth/check-email`                          |
| Old `/login`      | Removed entirely (404)                                       |

## Routes

```
New routes:
  /admin/auth/login       → Admin login page
  /clients/auth/login     → Client login page
  /clients/auth/check-email → Client magic-link confirmation

Removed:
  /login                  → 404
  /login/check-email      → 404

Unchanged:
  /admin/*                → Admin portal (server-side layout)
  /dashboard/*            → Client portal (client-side layout)
```

## Project Structure

```
src/
  app/
    (auth)/                     → DELETE entire route group
      login/
      check-email/
    admin/
      auth/
        login/                  ← NEW
          page.tsx
          admin-login.module.css
      layout.tsx                → Update auth redirect URL
    clients/
      auth/
        login/                  ← NEW
          page.tsx
          client-login.module.css
        check-email/            ← NEW (moved)
          page.tsx
  features/
    auth/
      components/
        admin-login-form.tsx    ← NEW (extracted from current login page)
        client-login-form.tsx   ← NEW (extracted from current login page)
  lib/
    navigation.ts              → Update portal URLs if needed
```

## Code Style

- Extract shared auth logic but keep presentation separate
- Each portal login page imports its own form component
- No shared login UI components — forms are portal-specific even if similar
- CSS Modules per portal (not shared global styles)

Example extract pattern:

```tsx
// src/features/auth/components/admin-login-form.tsx
'use client'

export function AdminLoginForm() {
  // Password auth logic (extracted from current login page)
  // Own styling via CSS module
}
```

## Testing Strategy

- Existing auth tests continue to pass
- New page tests for each login page (basic render, form submit)
- Middleware tests verify redirect URLs point to correct portal login

## Boundaries

- **Always do:** Update middleware redirect URLs, verify auth flow end-to-end, run typecheck + lint before closing
- **Ask first:** Adding new dependencies, changing auth provider, restructuring route groups
- **Never do:** Change auth logic, modify Supabase client config, remove redirect fallbacks

## Success Criteria

- [ ] `/admin/auth/login` renders admin login form (password auth)
- [ ] `/clients/auth/login` renders client login form (magic link auth)
- [ ] `/login` returns 404 (removed)
- [ ] Unauthenticated `/admin/*` redirects to `/admin/auth/login`
- [ ] Unauthenticated `/dashboard/*` redirects to `/clients/auth/login`
- [ ] Different styling between admin and client login pages
- [ ] Admin login redirects to `/admin` on success
- [ ] Client login redirects to `/dashboard` on success
- [ ] Client magic-link check-email at `/clients/auth/check-email`
- [ ] All existing tests pass
- [ ] TypeScript: zero errors
- [ ] ESLint: zero errors
- [ ] Build succeeds
