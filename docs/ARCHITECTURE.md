# Architecture — nova-mir-product

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Hosting**: Vercel
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase SSR — session-based, middleware + inline checks on every protected route
- **CORS**: Middleware-level allowlist via `CORS_ORIGINS` env var (comma-separated). Preflight returns 204.
- **CSP**: `frame-ancestors 'none'`, `form-action 'self'`, `base-uri 'self'`, `upgrade-insecure-requests` via security headers in next.config.ts
- **Rate Limiting**: Upstash Redis with in-memory fallback (`lib/rate-limit.ts`). Wired on every mutation endpoint.
- **CSRF**: Origin header validation via middleware on all POST/PUT/PATCH/DELETE requests.
- **Validation**: Zod schemas on all mutation endpoints (leads, appointments, bootstrap, admin routes, MFA, CRUD).
- **Payments**: Stripe (server-side)
- **Monitoring**: Sentry
- **Email**: SMTP via Resend (transactional)
- **File Storage**: Supabase Storage (documents)
- **Notifications**: Slack (lead alerts, error notifications)
- **Cache**: Upstash Redis (rate limiting via sliding window)
- **Analytics**: Plausible

## Directory Structure

```
├── middleware.ts           # Edge-level auth (Supabase SSR session check)
├── lib/                    # Shared utilities
│   ├── supabase-server.ts  # SSR client (ANON key — respects RLS)
│   ├── supabase-admin.ts   # Service-role client (server-only)
│   ├── roles.ts            # Role-based permissions
│   ├── api-keys.ts         # API key generation + validation
│   ├── rate-limit.ts       # Rate limiting (in-memory; Redis-ready)
│   ├── sanitize.ts         # Input sanitization
│   ├── audit-log.ts        # Audit trail
│   ├── pricing.ts          # Shared pricing tier config
│   └── navigation.ts       # Nav structure + app config
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout (metadata, fonts, JSON-LD, theme)
│   │   ├── error.tsx       # Global error boundary
│   │   ├── loading.tsx     # Global loading state
│   │   ├── robots.ts       # robots.txt route
│   │   ├── sitemap.ts      # sitemap.xml route
│   │   ├── json-ld.tsx     # Structured data (Organization, WebSite, Service)
│   │   ├── (public)/       # Public marketing pages
│   │   │   ├── page.tsx            # Home page
│   │   │   ├── about/page.tsx      # About page
│   │   │   ├── contact/page.tsx    # Contact form
│   │   │   ├── services/page.tsx   # Services page
│   │   │   ├── portfolio/page.tsx  # Portfolio
│   │   │   ├── pricing/page.tsx    # Pricing
│   │   │   ├── process/page.tsx    # How it works
│   │   │   ├── privacy/page.tsx    # Privacy policy
│   │   │   ├── terms/page.tsx      # Terms of service
│   │   │   ├── intake/page.tsx     # Project intake form
│   │   │   └── do-not-sell/page.tsx # CCPA opt-out
│   │   ├── admin/          # Admin dashboard (auth, noindex)
│   │   │   ├── auth/login/page.tsx
│   │   │   └── (main)/
│   │   │       ├── page.tsx                  # Dashboard home
│   │   │       ├── leads/page.tsx            # Lead tracker
│   │   │       ├── clients/page.tsx          # Client list
│   │   │       ├── clients/[id]/page.tsx     # Client detail
│   │   │       ├── projects/page.tsx         # Project list
│   │   │       ├── projects/[id]/page.tsx    # Project detail
│   │   │       ├── billing/page.tsx          # Billing
│   │   │       ├── revenue/page.tsx          # Revenue tracking
│   │   │       ├── audit/page.tsx            # Audit log viewer
│   │   │       ├── monitoring/page.tsx       # System monitoring
│   │   │       ├── settings/page.tsx         # Admin settings
│   │   │       ├── bootstrap/page.tsx        # Setup wizard
│   │   │       ├── admins/page.tsx           # Admin user management
│   │   │       ├── compliance/dsar/page.tsx  # DSAR management
│   │   │       └── content/
│   │   │           ├── hero-headlines/page.tsx
│   │   │           └── portfolio/page.tsx
│   │   ├── clients/        # Client portal (auth)
│   │   │   └── auth/
│   │   │       ├── login/page.tsx
│   │   │       └── check-email/page.tsx
│   │   ├── setup/page.tsx  # Initial setup (admin)
│   │   ├── api/            # API routes (29 routes)
│   │   │   ├── leads/route.ts
│   │   │   ├── leads/[id]/route.ts
│   │   │   ├── appointments/route.ts
│   │   │   ├── admin/api-keys/route.ts
│   │   │   ├── admin/audit/route.ts
│   │   │   ├── admin/billing/route.ts
│   │   │   ├── admin/leads/route.ts
│   │   │   ├── admin/clients/route.ts
│   │   │   ├── admin/clients/invite/route.ts
│   │   │   ├── admin/bootstrap/route.ts
│   │   │   ├── admin/compliance/dsar/route.ts
│   │   │   ├── admin/content/hero-headlines/route.ts
│   │   │   ├── admin/content/portfolio/route.ts
│   │   │   ├── auth/me/route.ts
│   │   │   ├── auth/mfa/enroll/route.ts
│   │   │   ├── auth/mfa/verify/route.ts
│   │   │   ├── clients/invoices/route.ts
│   │   │   ├── clients/me/route.ts
│   │   │   ├── compliance/data-access/route.ts
│   │   │   ├── compliance/data-deletion/route.ts
│   │   │   ├── compliance/data-correction/route.ts
│   │   │   ├── compliance/opt-out/route.ts
│   │   │   ├── content/hero-headlines/route.ts
│   │   │   ├── crud/[entity]/route.ts
│   │   │   ├── documents/route.ts
│   │   │   ├── export/route.ts
│   │   │   ├── health/route.ts
│   │   │   ├── notifications/route.ts
│   │   │   └── revalidate/route.ts
│   ├── features/           # Feature modules
│   │   ├── admin/                  # Admin feature group
│   │   │   ├── audit/
│   │   │   ├── billing/
│   │   │   ├── bootstrap/
│   │   │   ├── clients/
│   │   │   ├── compliance/
│   │   │   ├── components/
│   │   │   ├── hero-headlines/
│   │   │   ├── hooks/
│   │   │   ├── leads/
│   │   │   ├── monitoring/
│   │   │   ├── portfolio/
│   │   │   ├── projects/
│   │   │   ├── revenue/
│   │   │   └── settings/
│   │   ├── appointments/          # Appointment scheduling
│   │   ├── auth/                  # Authentication
│   │   ├── bootstrapper/          # Project bootstrapper
│   │   ├── compliance/            # GDPR/CCPA compliance
│   │   └── leads/                 # Lead management
│   └── lib/slack.ts        # Slack notification helper
```

## API Routes

| Route                 | Methods   | Auth                     | Rate Limited | Validation |
| --------------------- | --------- | ------------------------ | ------------ | ---------- |
| `/api/leads`          | GET, POST | GET: admin, POST: public | POST only    | Zod        |
| `/api/leads/[id]`     | PATCH     | Admin                    | Yes          | Zod        |
| `/api/appointments`   | GET, POST | Required                 | POST only    | Zod        |
| `/api/admin/api-keys` | GET, POST | Required + role check    | POST only    | Zod        |
| `/api/admin/audit`    | GET       | Required + admin role    | Yes          | N/A        |
| `/api/admin/billing`  | GET, POST | Required + admin role    | Yes          | N/A        |
| `/api/admin/clients`  | GET, POST | Required + admin role    | Yes          | N/A        |
| `/api/admin/leads`    | GET       | Required + admin role    | Yes          | N/A        |
| `/api/auth/mfa/*`     | POST      | Required                 | Yes          | Zod        |
| `/api/auth/me`        | GET       | None (self-service)      | Yes          | N/A        |
| `/api/bootstrap`      | POST      | Required + admin role    | Yes          | Zod        |
| `/api/compliance/*`   | Various   | Required                 | Yes          | Zod        |
| `/api/crud/[entity]`  | Various   | Required + admin role    | Yes          | Zod        |
| `/api/documents`      | Various   | Required + role check    | Yes          | Zod        |
| `/api/export`         | GET       | Required + admin role    | Yes          | N/A        |
| `/api/health`         | GET       | None                     | Yes          | N/A        |
| `/api/notifications`  | Various   | Required + admin role    | Yes          | Zod        |

## Authentication Flow

- **Middleware** (`middleware.ts`): Edge-level session check via Supabase SSR — CORS preflight handler, CSRF origin validation on state-changing methods, redirects unauthenticated `/admin/*` traffic to `/`, returns 401 on protected API routes
- **Inline checks**: Every protected API route and the admin layout verify auth a second time (defense in depth). Admin routes also verify role === 'admin'.
- **Service role**: Used only where RLS bypass is required (public lead submission, admin bulk operations). All user-bound operations use the ANON key via `createClient()`. Never used in user-facing SSR.
- **Rate limiting**: All mutation endpoints use Upstash Redis sliding window (10 req/min per IP by default). Falls back to in-memory counter when Redis unavailable.

## Data Model

- **Database**: PostgreSQL on Supabase
- **Tables**: 25 tables (see AGENTS.md for full list). Core: users, leads, projects, portfolio_invoices, support_tickets, appointments, documents, payments, activity_logs, revenue_entries, expense_entries
- **Search**: none
