# Supabase Migration Strategy

## Current State

- **schema.sql**: Source of truth (613 lines) — 25 tables, all RLS policies, indexes
- **supabase/migrations/**: Single forward-only migration file for schema reconciliation
- **No Supabase CLI integration**: schema.sql is manually applied via SQL Editor
- **No rollback support**: schema.sql is designed as a single-run initial schema

## Principles

1. **schema.sql is the single source of truth**. All table definitions, RLS, indexes, and policies live here.
2. **Migrations are additive only**. Never modify schema.sql retroactively after production deploy — add a new migration file.
3. **One migration file per logical change**. Group related column changes together, but keep distinct features in separate files.
4. **Migrations are forward-only**. No rollback scripts. If something goes wrong, add a new migration to fix it.
5. **Migration files use `IF NOT EXISTS` / `IF EXISTS` guards** so they're idempotent.

## Workflow

### Before Production

Edit schema.sql directly + apply via Supabase SQL Editor. No migration files needed.

### After Production (Current State)

Changes must go through migration files in `supabase/migrations/`:

1. Create `supabase/migrations/YYYYMMDD_description.sql`
2. Use `ALTER TABLE ADD COLUMN IF NOT EXISTS` or `CREATE TABLE IF NOT EXISTS` for additive changes
3. For destructive changes: `DROP VIEW IF EXISTS` before recreating, never DROP TABLE in a migration
4. Apply via Supabase Dashboard → SQL Editor
5. Update schema.sql to match the new state (for future reference)

### CI/CD Integration (Future)

Set up `supabase db push` in CI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
supabase link --project-ref <your-project-ref>

# Dry run in CI
supabase db push --dry-run

# Apply on deploy
supabase db push
```

## Rules

1. **Never drop a column that has data** — mark as deprecated and remove in a later migration
2. **Every migration must be idempotent** — use `IF NOT EXISTS` / `IF EXISTS`
3. **Test migrations on staging first** — apply to a staging Supabase project before production
4. **Document each migration** — include the purpose and any manual data backfill steps
5. **Keep schema.sql in sync** — after applying a migration, update schema.sql to match

## Migration File Template

```sql
-- YYYYMMDD_description.sql
-- Description of what this migration does and why

-- Add new column (idempotent)
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS new_column TEXT;

-- Add RLS policy (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'policy_name'
  ) THEN
    CREATE POLICY "policy_name" ON table_name FOR SELECT USING (true);
  END IF;
END $$;

-- Create new table
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
```

## Current Migrations

### 20260625_reconcile_schema_app.sql

Applied: 2026-06-25
Purpose: Added missing columns to existing tables, created revenue_entries and expense_entries tables, added missing RLS policies.
Changes:

- Added user_id column to portfolio_clients
- Added client_id, date, invoice_number to portfolio_invoices
- Added amount to line_items
- Added status, project_count to portfolio_clients
- Added notes, consent to leads
- Added deadline, progress to projects
- Added client_name, performed_by, project_name to activity_logs
- Added category to documents
- Created revenue_entries table
- Created expense_entries table
- Added admin SELECT RLS policies for all admin-managed tables
