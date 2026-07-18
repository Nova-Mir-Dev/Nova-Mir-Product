# Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:7510c1e2 -->

## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->

## Project

**nova-mir-product** — Next.js 16 (App Router) full-stack app for Nova Mir. Hosts the marketing site (novamir.dev), admin portal, and client dashboard in one repo with route groups: `(public)/`, `admin/(main)/`, `(client)/dashboard/`. Deploys to Vercel; backend is Supabase (Postgres + Auth); UI built on the `azimuth-ui` component library.

## Build & Test

```bash
npm install            # install deps (Node >=20, npm >=10)
npm run dev            # dev server on :3000
npm run build          # production build
npm run typecheck      # tsc --noEmit (zero errors required)
npm run lint           # eslint . (zero warnings required)
npm test               # vitest run
npm run format         # prettier --write .
npm run verify         # full gate: typecheck + lint + test + build + prettier check
npm run audit:content  # content-audit script (DB-backed copy check)
npm run check:assets   # verify public/ assets
```

Quality gates must pass before merge: typecheck (0 errors) → build (succeeds) → lint (0 warnings) → format (all formatted) → tests (all passing). New UI must pass WCAG 2.2 AA. See AGENTS.md "Quality Gates" for the full checklist.

## Architecture Overview

- **Framework**: Next.js 16 App Router, React 19, TypeScript 6
- **Route groups**: `(public)/` (marketing site), `admin/(main)/` (admin portal), `(client)/dashboard/` (client portal)
- **Backend**: Supabase (Postgres) with Row-Level Security; auth via `@supabase/ssr` SSR session checks + middleware
- **Hosting**: Vercel
- **UI**: `azimuth-ui` component library (Text, Card, Stack, Grid, Button, Input, Alert, etc.) — prefer over custom CSS
- **Co-located features**: each feature is self-contained under `src/features/{feature}/` with `types.ts`, `{feature}.tsx`, `{feature}.module.css`, `use-{feature}.ts`, `components/`. No barrel `index.ts` in sub-folders. Components split after ~100 lines.
- **Content architecture**: frequently-updated content (pricing, portfolio projects, nav links, hero headlines, testimonials, process steps) lives in DB tables with admin CRUD + RLS, not hardcoded. SEO-critical/architectural content stays in code. See AGENTS.md "Content Architecture Rule".
- **Pricing consistency**: the live DB `pricing_tiers`, `supabase/seed-content.sql`, the `PRICING_TIERS` fallback in `src/lib/pricing.ts`, and the Nova Mir Planning `Pricing-Guide.md` must stay identical in one PR. Prices are whole DOLLARS (DB CHECK rejects ≥ 100000); `pricing-consistency.test.ts` enforces seed↔fallback parity. See AGENTS.md "Pricing Consistency Rule".
- **Ops runbook**: `docs/RUNBOOK.md` — restoring a paused Supabase project, applying migrations via the Management API, the CRON_SECRET, and re-seeding content.
- **i18n**: next-intl, locales `en`/`es`/`ru` (cookie → Accept-Language → en). Register: Spanish = tú, Russian = lowercase вы — decided against brand voice + market convention; never mix registers. The es/ru catalogs are machine drafts pending native-speaker review (beads e1iy.2.3/e1iy.2.4) and must not be promoted to marketing surfaces before that pass. `docs/I18N.md` is the authority (register rationale + sources, add-a-locale checklist, flagged vocabulary calls, Russian 4-form plural warning). The catalog-parity test enforces structure only — linguistic quality is always a human pass. See AGENTS.md "Internationalization Rule".
- **Integrations**: Stripe (billing), Resend + React Email (transactional email), Twilio (SMS), Upstash ratelimit + redis, Sentry (monitoring), Slack Bolt
- **Database tables**: ~25 tables — core (`users`, `audit_logs`, `api_keys`, `appointments`, `sessions`, `payments`, `documents`, `signatures`, `support_tickets`, `projects`, `leads`, `activity_logs`), portfolio/billing (`portfolio_clients`, `portfolio_invoices`, `line_items`, `revenue_entries`, `expense_entries`), DB-driven content (`pricing_tiers`, `hero_headlines`, `public_nav_links`, `process_steps`, `testimonials`, `portfolio_projects`, `content_history`), and `ccpa_opt_outs`. AGENTS.md "Database Tables" is the maintained list.
- **API routes**: `/api/{health,leads,appointments,export}`, `/api/cron/keep-alive`, `/api/content/*`, `/api/admin/*`, `/api/clients/*`, `/api/invoices/[id]/download`, `/api/auth/mfa/*`, `/api/compliance/{data-access,data-deletion,data-correction,opt-out}` (DSAR). AGENTS.md "API Routes" is the maintained list.
- **Env**: see `.env.example` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`
- **Compliance**: DSAR endpoints at `/api/compliance/*` for ca, us, eu, uk, mx, au. See `docs/COMPLIANCE.md`, `docs/PRIVACY.md`.

## Beads Prefix

Issues in this repo use the **`Nova-Mir-Product`** prefix (NOT `NMP-`). When creating beads, use descriptive titles.

## Conventions & Patterns

- **Tool-first philosophy**: prefer scripts over agents. Type checking, linting, formatting, build verification are all 0-token script ops. Only invoke an agent for spec writing, architectural decisions, code review, debugging, design/polish. Rule: if a script can do it, write a script. See AGENTS.md "Tool-First Philosophy".
- **No comments** unless explaining non-obvious business logic.
- **Prefer simple over clever** — three similar lines beat a premature abstraction.
- **Props interfaces co-located** with their component.
- **14-rule quality contract** (`~/.config/opencode/agent-skills/references/quality-standards.md`): auth inline on every route + server action, data minimization, Zod validation on every mutation, error/loading/empty states on every page, SEO on public pages, never use service role in user-facing SSR, httpOnly+secure+SameSite auth cookies, rate limiting on every mutation endpoint, clean npm audit before merge, JSDoc on exported functions/types. Run `skill { name: "full-audit" }` before releases.
- **Must-use skills**: spec-driven-development (before features), plan-council (before significant implementations), test-driven-development (for logic), code-review-and-quality (before merge), incremental-implementation (multi-file changes), doubt-driven-development (security-sensitive), security-and-hardening (GDPR data).
- **Brand & copy**: this repo's brand voice, headline bank, and marketing copy guidelines live in the **Nova Mir Planning** repo (sibling): `Nova Mir Planning/tasks/business-knowledge/brand-voice.md` (tone, words to use/avoid), `Nova Mir Planning/tasks/hero-headlines.md` (active/retired hero+tagline pairs for rotating slot system). Check these before writing copy — brand voice overrides anything inferred from code.
