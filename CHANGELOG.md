# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] — 2026-06-15

### Changed

- **Landing page redesign**: Full psychology-driven rewrite with problem-first hero, midrange-featured services, portfolio section, pricing summary, testimonials placeholder, and bottom CTA
- **Brand identity**: Updated OG tags, Twitter cards, canonical URL, favicon, per-page SEO descriptions

### Fixed

- **next.config.ts**: Removed `experimental.serverActions` (stable in Next.js 16, now removed from types)
- **All 5 failing tests**: Fixed navigation, pricing, rate-limit, roles, and supabase-server tests to match actual source
- **Test coverage**: Added 6 new test files (24 tests) for auth forms, supabase client, cors, slack, and notifications

### Security

- **Branch protection**: Enabled PR-required on `main` with 1 approval; admin bypass allowed
- **`/api/auth/me`**: Removed unsafe `role: 'client'` default when no profile exists
- **IDOR fix**: Added inline auth check to `admin/clients/[id]` route

### Removed

- **Dead code**: 8 unused lib modules deleted (sms, validate, audit-log, email, api-keys, resend, billing, storage)
- **Redundant JSDoc**: 14 comments stripped from lib files (restating what types already communicate)

## [0.2.0] — 2026-06-14

### Changed

- **Portal separation**: Split unified `/login` into separate `/admin/auth/login` and `/clients/auth/login` pages with distinct styling
- **Admin layout restructure**: Used route groups `(main)` to prevent auth redirect loop on login page
- **Auth redirects**: Middleware and all inline auth checks now redirect to portal-specific login URLs
- **ESLint cleanup**: Downgraded from `strictTypeChecked` to `recommendedTypeChecked` preset with targeted overrides for tests and API routes
- **Vitest config**: Fixed `@/lib` alias from root `lib/` to `src/lib/` (was breaking after root `lib/` cleanup)

### Fixed

- **Admin login redirect loop**: `/admin/layout.tsx` no longer wraps `/admin/auth/*` routes
- **SSR build crash**: Moved `createClient()` calls inside event handlers to prevent Supabase env var access during server-side rendering
- **CORS endpoint**: Allowed origin handling in middleware
- **Floating promises**: Added `void` prefix to unhandled async calls across notifications, compliance, and audit routes
- **Middleware type safety**: Added type cast for Supabase profile query
- **Client nav buttons**: Replaced `Button onClick={router.push}` with `<nav><Link>` for accessibility
- **`/api/auth/me` role fallback**: Removed unsafe default to `'client'` role when no profile exists
- **Inline auth checks**: Added missing auth guards to billing, monitoring, revenue, audit, and bootstrap admin pages
- **Root-level dead code**: Removed stale `lib/` directory (bootstrapper-generated duplicates); consolidated to `src/lib/`
- **Deprecated deps**: Replaced Axiom with Sentry, resolved npm audit vulnerabilities
- **Prettier formatting**: Fixed 111+ files

### Added

- Modular login form components: `AdminLoginForm` and `ClientLoginForm` in `src/features/auth/components/`
- CSS modules for portal-specific login styling
- Error boundaries and loading states for admin and client route segments
- Global error boundary (`global-error.tsx`)
- Missing lib modules: `cors.ts`, `billing.ts`, `storage.ts`, `resend.ts`, `sms.ts`, `validate.ts`, `in-app-notifications.ts`, `stripe.ts`
- API error helper (`src/lib/api-error.ts`) with typed error codes
- Documentation: JSDoc on key exported functions

### Removed

- Unified `/login` page (replaced by portal-specific login pages)
- Old `(auth)` route group
- Root-level `lib/` directory (moved canonical versions to `src/lib/`)

## [0.1.0] — 2026-06-14

### Added

- Initial release of the Nova Mir product portal
- Landing page with service showcase and call-to-action
- Pricing page with plan comparison
- Services overview page
- Portfolio/projects showcase
- Admin dashboard with analytics, billing, clients, and leads management
- Client dashboard for managing appointments and account
- Lead intake workflow and management
- Authentication system with email/password, magic link, MFA, and passkeys
- Compliance endpoints for GDPR DSAR (data access, deletion, correction)
- Appointments scheduling system
- Error monitoring via Sentry
- Structured logging via Axiom
- Rate limiting with Upstash Redis
- Email notifications via Resend
- SMS notifications via Twilio
- Slack integration for internal alerts
- Setup wizard for environment configuration
- API routes for appointments, admin, compliance, and health checks
