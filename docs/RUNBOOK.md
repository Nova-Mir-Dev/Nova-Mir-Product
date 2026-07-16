# Operations Runbook

Common operational tasks for nova-mir-product. Backend is Supabase (project ref
`egswvhfpheicsrgzpyqa`, "Product Page", free tier); hosting is Vercel; the site
is https://www.novamir.dev.

The Supabase Management API token lives in the macOS keychain:

```bash
security find-generic-password -s "Supabase CLI" -w
```

## Restore a paused Supabase project

The free-tier project auto-pauses after ~7 days without database activity; when
paused, every DB-backed route returns 500. A keep-alive cron
(`/api/cron/keep-alive`, Mon/Thu 09:00 UTC) is meant to prevent this, but if the
project is found paused:

```bash
TOKEN=$(security find-generic-password -s "Supabase CLI" -w)
# Check status
curl -s "https://api.supabase.com/v1/projects/egswvhfpheicsrgzpyqa" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"status":"[^"]*"'
# Restore
curl -s -X POST "https://api.supabase.com/v1/projects/egswvhfpheicsrgzpyqa/restore" \
  -H "Authorization: Bearer $TOKEN"
```

Restore takes a few minutes; poll status until `ACTIVE_HEALTHY`. If pausing
recurs despite the cron, upgrade to Pro (see `Nova-Mir-Product-27i`).

## Apply a database migration

Migrations live in `supabase/migrations/`. This project's migration history is
not linked to the CLI, so migrations are applied via the Management API query
endpoint (the same path used to create every migration in that folder):

```bash
TOKEN=$(security find-generic-password -s "Supabase CLI" -w)
SQL=$(cat supabase/migrations/<file>.sql)
curl -s -X POST \
  "https://api.supabase.com/v1/projects/egswvhfpheicsrgzpyqa/database/query" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "$(jq -n --arg q "$SQL" '{query:$q}')"
```

Always commit the migration file alongside applying it. Note: Postgres does not
support `CREATE POLICY IF NOT EXISTS` — use `DROP POLICY IF EXISTS` + `CREATE
POLICY`. RLS policies do nothing without table-level `GRANT`s; when a policy
"exists but does not work", check `information_schema.role_table_grants`.

## Rotate / set the cron secret

The keep-alive cron authenticates with `CRON_SECRET` (Vercel sends it as a
Bearer token to cron routes):

```bash
openssl rand -hex 32                       # generate
vercel env add CRON_SECRET production      # paste the value
vercel env ls production | grep CRON_SECRET # verify
# smoke test after deploy:
curl -s -H "Authorization: Bearer <secret>" https://www.novamir.dev/api/cron/keep-alive
# → {"ok":true,"db":true,...}
```

## Re-seed public content

`supabase/seed-content.sql` holds pricing tiers, hero headlines, nav links,
process steps, and portfolio projects. Pricing must stay dollar-denominated and
value-identical to `src/lib/pricing.ts` (a CI test,
`src/lib/__tests__/pricing-consistency.test.ts`, enforces this). Apply the seed
the same way as a migration.

## Deploy

Pushing to `main` triggers a Vercel production deploy. To watch it:

```bash
vercel ls --prod          # latest deployment + status
vercel inspect <url> --wait
```

## Common incidents

- **All DB routes 500** → Supabase paused; restore (above).
- **A content API returns 503** → deliberate: upstream DB error, retry per
  `Retry-After`.
- **Admin pages show $0 / empty everywhere** → likely an RLS/grant regression;
  SSR pages now throw to the error boundary on query error rather than showing
  empty, so check Sentry and `role_table_grants`.
