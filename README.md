# Nova Mir Product Portal

Web development for small businesses. Custom websites, lead systems, and operational tools.

## Portals

| Portal        | URL            | Auth                      | Audience       |
| ------------- | -------------- | ------------------------- | -------------- |
| **Marketing** | `/`            | Public                    | Everyone       |
| **Admin**     | `/admin/*`     | Password (email/password) | Internal team  |
| **Client**    | `/dashboard/*` | Magic link                | Active clients |

### Auth

- **Admin login**: `/admin/auth/login` — password-based, redirects to `/admin`
- **Client login**: `/clients/auth/login` — magic-link, redirects to `/dashboard`
- **Middleware**: Edge-level auth enforcement + role-based routing. Layout-level inline checks for defense in depth.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase SSR (session-based)
- **Hosting**: Vercel
- **Monitoring**: Sentry + Upstash Redis
- **Analytics**: Plausible
- **Cache**: Upstash Redis (with in-memory fallback)
- **Integrations**: Resend, Slack, Twilio, Stripe

## Theme

The app uses `azimuth-ui`'s `ThemeProvider` for dark/light mode support via `src/components/theme-root.tsx`. A `ThemeToggle` component (`src/components/theme-toggle.tsx`) cycles between light, dark, and system modes and is rendered in the admin shell, client shell, and public marketing shell.

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your values
npm run dev
```

## Scripts

| Command                 | Description                  |
| ----------------------- | ---------------------------- |
| `npm run dev`           | Start development server     |
| `npm run build`         | Production build             |
| `npm run typecheck`     | TypeScript type checking     |
| `npm run lint`          | Lint all source files        |
| `npm run format`        | Format with Prettier         |
| `npm test`              | Run tests (Vitest)           |
| `npm run verify`        | Run full verification suite  |
| `npm run check:assets`  | Check public assets          |
| `npm run audit:content` | DB-backed content copy audit |
| `npm run start`         | Start production server      |

## Environment Variables

| Variable                        | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (safe for client)                            |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (server-only)                             |
| `CORS_ORIGINS`                  | Comma-separated allowed CORS origins (default: https://novamir.dev) |
| `UPSTASH_REDIS_REST_URL`        | Upstash Redis REST URL for rate limiting                            |
| `UPSTASH_REDIS_REST_TOKEN`      | Upstash Redis REST token                                            |
| `NEXT_PUBLIC_SENTRY_DSN`        | Sentry DSN for client-side error tracking                           |
| `SENTRY_AUTH_TOKEN`             | Sentry auth token for sourcemap uploads                             |
| `SENTRY_ORG`                    | Sentry organisation slug                                            |
| `SENTRY_PROJECT`                | Sentry project slug                                                 |
| `SLACK_BOT_TOKEN`               | Slack bot token for messaging                                       |
| `SLACK_SIGNING_SECRET`          | Slack signing secret for verifying requests                         |
| `CRON_SECRET`                   | Bearer secret for Vercel cron routes (keep-alive)                   |

See `.env.example` for the full list.

## Quality Gates

Before deploying, ensure these pass:

- `npm run typecheck` — zero errors
- `npm run build` — succeeds
- `npm test` — full Vitest suite (844+ tests) passing
- `npm run lint` — zero errors
- `npx prettier --check .` — all files formatted

## Architecture

```
src/
  app/
    admin/
      (main)/           → Admin portal (auth-protected)
      auth/login/       → Admin login page
    clients/auth/       → Client login + magic-link confirmation
    (client)/dashboard/ → Client portal
    (public)/           → Marketing pages
    api/                → API routes
  components/
    theme-root.tsx      → ThemeProvider wrapper (dark/light mode)
    theme-toggle.tsx    → Dark/light/system mode toggle
    admin-shell.tsx     → Admin layout shell
  features/
    admin/              → Admin components & logic
    auth/               → Auth components (login forms)
    ...                 → Other feature modules
  lib/                  → Shared utilities
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a full architecture overview and [docs/RUNBOOK.md](docs/RUNBOOK.md) for operational tasks (Supabase restore, migrations, cron secret).

### Compliance Docs

- [COMPLIANCE.md](docs/COMPLIANCE.md) — Regulatory requirements for target markets
- [SECURITY.md](docs/SECURITY.md) — Security hardening checklist
- [PRIVACY.md](docs/PRIVACY.md) — Privacy policy
- [DATA_RETENTION.md](docs/DATA_RETENTION.md) — Data retention schedule
