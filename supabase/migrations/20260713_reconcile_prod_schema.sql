-- Corrected re-application of 20260625_reconcile_schema_app.sql, which never
-- ran in production: CREATE POLICY IF NOT EXISTS is not valid Postgres, and
-- its users_select_admin policy self-references users (infinite recursion).
-- Changes from the original (Nova-Mir-Product-o9v):
--   * DROP POLICY IF EXISTS + CREATE POLICY instead of IF NOT EXISTS
--   * is_admin() SECURITY DEFINER function instead of per-policy EXISTS
--     subqueries (avoids recursion on users, one definition to maintain)
--   * portfolio_invoices.client_id references portfolio_clients(id), not
--     users(id) — the billing route stores portfolio_clients ids there
--   * portfolio_clients.user_id added (billing route links invoices to the
--     client's auth user through it)
--   * explicit grants for the two new tables
-- Applied to production 2026-07-13 via Management API.

ALTER TABLE portfolio_invoices ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES portfolio_clients(id);
ALTER TABLE portfolio_invoices ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE portfolio_invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;

ALTER TABLE line_items ADD COLUMN IF NOT EXISTS amount INTEGER NOT NULL DEFAULT 0;

ALTER TABLE portfolio_clients ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE portfolio_clients ADD COLUMN IF NOT EXISTS project_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE portfolio_clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0;

ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS performed_by TEXT;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS project_name TEXT;

ALTER TABLE documents ADD COLUMN IF NOT EXISTS category TEXT;

CREATE TABLE IF NOT EXISTS revenue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'service' CHECK (category IN ('service', 'product', 'consulting', 'retainer', 'other')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE revenue_entries ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS expense_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'software' CHECK (category IN ('software', 'hosting', 'contractor', 'travel', 'office', 'marketing', 'other')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE expense_entries ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.revenue_entries, public.expense_entries TO service_role;
GRANT SELECT ON public.revenue_entries, public.expense_entries TO authenticated;

-- Runs as owner so it can read users regardless of RLS; prevents the
-- users-policy-references-users recursion the original migration had.
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "users_select_admin" ON users;
CREATE POLICY "users_select_admin" ON users FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "portfolio_invoices_admin_select" ON portfolio_invoices;
CREATE POLICY "portfolio_invoices_admin_select" ON portfolio_invoices FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "portfolio_clients_admin_select" ON portfolio_clients;
CREATE POLICY "portfolio_clients_admin_select" ON portfolio_clients FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "line_items_admin_select" ON line_items;
CREATE POLICY "line_items_admin_select" ON line_items FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "activity_logs_admin_select" ON activity_logs;
CREATE POLICY "activity_logs_admin_select" ON activity_logs FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "leads_admin_select" ON leads;
CREATE POLICY "leads_admin_select" ON leads FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "projects_admin_select" ON projects;
CREATE POLICY "projects_admin_select" ON projects FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "support_tickets_select_admin" ON support_tickets;
CREATE POLICY "support_tickets_select_admin" ON support_tickets FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "revenue_entries_admin_select" ON revenue_entries;
CREATE POLICY "revenue_entries_admin_select" ON revenue_entries FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "expense_entries_admin_select" ON expense_entries;
CREATE POLICY "expense_entries_admin_select" ON expense_entries FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "hero_headlines_admin_select" ON hero_headlines;
CREATE POLICY "hero_headlines_admin_select" ON hero_headlines FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "portfolio_projects_admin_select" ON portfolio_projects;
CREATE POLICY "portfolio_projects_admin_select" ON portfolio_projects FOR SELECT
  TO authenticated USING (is_admin());
