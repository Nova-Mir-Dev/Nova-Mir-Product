# Architecture — nova-mir-product

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Hosting**: Vercel
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase SSR — session-based, middleware + inline checks on every protected route
- **CORS**: Middleware-level allowlist via `CORS_ORIGINS` env var (comma-separated). Preflight returns 204.
- **CSP**: `frame-ancestors 'none'`, `form-action 'self'`, `base-uri 'self'`, `upgrade-insecure-requests` via security headers in next.config.ts
- **Rate Limiting**: Upstash Redis with in-memory fallback (`lib/rate-limit.ts`). Wired on every mutation endpoint.
- **CSRF**: Origin header validation via middleware on all POST/PUT/PATCH/DELETE requests.
- **Validation**: Zod schemas on all mutation endpoints (leads, appointments, bootstrap, admin routes, MFA, CRUD).
- **Payments**: none
- **Monitoring**: Sentry
- **Email**: none
- **File Storage**: none
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
│   │   ├── api/            # API routes
│   │   │   ├── leads/route.ts          # GET (auth) + POST (public, rate-limited)
│   │   │   ├── leads/[id]/route.ts     # PATCH (auth + rate-limited)
│   │   │   ├── appointments/route.ts   # GET (auth) + POST (auth + rate-limited)
│   │   │   ├── admin/api-keys/route.ts # GET + POST (auth + role check)
│   │   │   ├── compliance/data-access  # DSAR access
│   │   │   ├── compliance/data-deletion# DSAR deletion
│   │   │   ├── compliance/data-correction # DSAR correction
│   │   │   └── health/route.ts         # Public health check
│   │   ├── page.tsx        # Home page
│   │   ├── about/          # About page
│   │   ├── contact/        # Contact form
│   │   ├── services/       # Services page
│   │   ├── portfolio/      # Portfolio
│   │   ├── pricing/        # Pricing
│   │   ├── process/        # How it works
│   │   ├── privacy/        # Privacy policy
│   │   ├── terms/          # Terms of service
│   │   ├── intake/         # Project intake form (noindex)
│   │   ├── setup/          # Setup wizard (admin, noindex)
│   │   └── admin/          # Admin dashboard (auth, noindex)
│   │       └── leads/      # Lead tracker (auth, noindex)
│   ├── features/           # Feature modules
│   │   ├── leads/schemas.ts      # Zod schemas for leads
│   │   └── appointments/schemas.ts # Zod schemas for appointments
│   └── lib/slack.ts        # Slack notification helper
```

## API Routes

| Route                 | Methods   | Auth                  | Rate Limited | Validation |
| --------------------- | --------- | --------------------- | ------------ | ---------- |
| `/api/leads`          | GET, POST | GET: admin, POST: public | POST only | Zod        |
| `/api/leads/[id]`     | PATCH     | Admin                 | Yes          | Zod        |
| `/api/appointments`   | GET, POST | Required              | POST only    | Zod        |
| `/api/admin/api-keys` | GET, POST | Required + role check | POST only    | Zod        |
| `/api/health`         | GET       | None                  | Yes          | N/A        |
| `/api/compliance/*`   | Various   | Required              | Yes          | Zod        |
| `/api/auth/me`        | GET       | None (self-service)   | Yes          | N/A        |
| `/api/admin/bootstrap`| POST      | Required + role check | Yes          | Zod        |
| `/api/admin/mfa/*`    | Various   | Required + role check | Yes          | Zod        |
| `/api/admin/crud/*`   | Various   | Required + role check | Yes          | Zod        |
| `/api/notifications/*`| Various   | Required + role check | Yes          | Zod        |
| `/api/leads/count`    | GET       | Admin                 | Yes          | N/A        |
| `/api/documents/*`    | Various   | Required + role check | Yes          | Zod        |

## Authentication Flow

- **Middleware** (`middleware.ts`): Edge-level session check via Supabase SSR — CORS preflight handler, CSRF origin validation on state-changing methods, redirects unauthenticated `/admin/*` traffic to `/`, returns 401 on protected API routes
- **Inline checks**: Every protected API route and the admin layout verify auth a second time (defense in depth). Admin routes also verify role === 'admin'.
- **Service role**: Used only where RLS bypass is required (public lead submission, admin bulk operations). All user-bound operations use the ANON key via `createClient()`. Never used in user-facing SSR.
- **Rate limiting**: All mutation endpoints use Upstash Redis sliding window (10 req/min per IP by default). Falls back to in-memory counter when Redis unavailable.

## Data Model

- **Database**: PostgreSQL on Supabase
- **Tables**: `users`, `leads`, `appointments`, `api_keys`, `audit_logs`
- **Search**: none
