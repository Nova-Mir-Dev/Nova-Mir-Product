-- 20260625_reconcile_schema_app.sql never ran in production (it uses
-- CREATE POLICY IF NOT EXISTS, which Postgres does not support), so leads was
-- missing consent/notes and the tightened insert policy — POST /api/leads
-- 500ed on 'column "consent" does not exist'. This applies just the leads
-- subset; full reconciliation is tracked separately.
-- Applied to production 2026-07-13 via Management API.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent BOOLEAN DEFAULT false;

DROP POLICY IF EXISTS "leads_anon_insert" ON leads;
CREATE POLICY "leads_anon_insert" ON leads FOR INSERT
  TO anon
  WITH CHECK (consent = true);
