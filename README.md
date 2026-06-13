# Nova-Mir-Product

Product portal for Nova Mir — web development for small businesses. Custom websites, lead systems, and operational tools.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase SSR (session-based, edge-level via middleware + inline)
- **Hosting**: Vercel
- **Monitoring**: Sentry
- **Analytics**: Plausible
- **Cache**: Upstash Redis
- **Integrations**: Slack

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your values
npm run dev
```

## Scripts

| Command              | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | Start development server |
| `npm run build`      | Production build         |
| `npm run typecheck`  | TypeScript type checking |
| `npm run lint`       | Lint all source files    |
| `npm run format`     | Format with Prettier     |
| `npm test`           | Run tests (Vitest)       |
| `npm run test:watch` | Run tests in watch mode  |

## Environment Variables

| Variable                        | Description                                        |
| ------------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (safe for client)           |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (server-only)            |
| `CORS_ORIGINS`                  | Comma-separated allowed CORS origins (default: https://novamir.dev) |
| `UPSTASH_REDIS_URL`             | Upstash Redis URL for rate limiting                |
| `UPSTASH_REDIS_TOKEN`           | Upstash Redis token                                |
| `NEXT_PUBLIC_SENTRY_DSN`        | Sentry DSN for client-side error tracking          |
| `SENTRY_AUTH_TOKEN`             | Sentry auth token for sourcemap uploads            |
| `SENTRY_ORG`                    | Sentry organisation slug                           |
| `SENTRY_PROJECT`                | Sentry project slug                                |
| `SLACK_BOT_TOKEN`               | Slack bot token for messaging                      |
| `SLACK_SIGNING_SECRET`          | Slack signing secret for verifying requests        |

See `.env.example` for the full list.

## Quality Gates

Before deploying, ensure these pass:

- `npm run typecheck` — zero errors
- `npm run build` — succeeds
- `npm test` — all tests passing
- `npm run lint` — zero warnings (pre-existing config issue noted)

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for architecture overview, route layout, and auth flow.

### Compliance Docs

- [COMPLIANCE.md](docs/COMPLIANCE.md) — Regulatory requirements for target markets
- [SECURITY.md](docs/SECURITY.md) — Security hardening checklist
- [PRIVACY.md](docs/PRIVACY.md) — Privacy policy
- [DATA_RETENTION.md](docs/DATA_RETENTION.md) — Data retention schedule
