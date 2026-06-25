-- Migration: Reconcile schema.sql with app code
-- Adds missing columns and tables that the app code references
-- Adds RLS policies for admin SSR pages using createClient()

-- portfolio_invoices: add client_id, date, invoice_number
ALTER TABLE portfolio_invoices ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES users(id);
ALTER TABLE portfolio_invoices ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE portfolio_invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- line_items: add amount
ALTER TABLE line_items ADD COLUMN IF NOT EXISTS amount INTEGER NOT NULL DEFAULT 0;

-- portfolio_clients: add status, project_count
ALTER TABLE portfolio_clients ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE portfolio_clients ADD COLUMN IF NOT EXISTS project_count INTEGER NOT NULL DEFAULT 0;

-- leads: add notes, consent
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent BOOLEAN DEFAULT false;

-- projects: add deadline, progress
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0;

-- activity_logs: add client_name, performed_by, project_name
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS performed_by TEXT;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS project_name TEXT;

-- documents: add category
ALTER TABLE documents ADD COLUMN IF NOT EXISTS category TEXT;

-- revenue_entries: new table
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
CREATE POLICY IF NOT EXISTS "revenue_entries_admin_only" ON revenue_entries FOR ALL
  USING (auth.role() = 'service_role');

-- expense_entries: new table
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
CREATE POLICY IF NOT EXISTS "expense_entries_admin_only" ON expense_entries FOR ALL
  USING (auth.role() = 'service_role');

-- RLS: Add admin SELECT policies for admin SSR pages using createClient()
-- Pattern: authenticated user with admin role can SELECT

CREATE POLICY IF NOT EXISTS "users_select_admin" ON users FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "portfolio_invoices_admin_select" ON portfolio_invoices FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "portfolio_clients_admin_select" ON portfolio_clients FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "line_items_admin_select" ON line_items FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "activity_logs_admin_select" ON activity_logs FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "leads_admin_select" ON leads FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "projects_admin_select" ON projects FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "support_tickets_select_admin" ON support_tickets FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "revenue_entries_admin_select" ON revenue_entries FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "expense_entries_admin_select" ON expense_entries FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "hero_headlines_admin_select" ON hero_headlines FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "portfolio_projects_admin_select" ON portfolio_projects FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
