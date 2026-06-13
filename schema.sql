-- =============================================================================
-- Users
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role TEXT NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_update_own" ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =============================================================================
-- Audit logs
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  user_id UUID REFERENCES users(id),
  metadata JSONB,
  ip_address TEXT
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_admin_only" ON audit_logs FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- API keys
-- =============================================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  prefix TEXT NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  scopes TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "api_keys_select_own" ON api_keys FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "api_keys_insert_own" ON api_keys FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "api_keys_update_own" ON api_keys FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "api_keys_delete_own" ON api_keys FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- Appointments / Scheduling
-- =============================================================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_time ON appointments(start_time);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointments_select_own" ON appointments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "appointments_insert_own" ON appointments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "appointments_update_own" ON appointments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "appointments_delete_own" ON appointments FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- Documents
-- =============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_select_own" ON documents FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "documents_insert_own" ON documents FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "documents_update_own" ON documents FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- Signatures / e-Signature
-- =============================================================================
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  signer_id UUID REFERENCES users(id),
  signed_at TIMESTAMPTZ,
  signature_data TEXT
);

ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signatures_select_related" ON signatures FOR SELECT
  USING (
    signer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM documents WHERE documents.id = signatures.document_id AND documents.user_id = auth.uid()
    )
  );
CREATE POLICY "signatures_insert_as_signer" ON signatures FOR INSERT
  WITH CHECK (signer_id = auth.uid());

-- =============================================================================
-- Sessions
-- =============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_select_own" ON sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "sessions_delete_own" ON sessions FOR DELETE USING (user_id = auth.uid());

-- =============================================================================
-- Payments
-- =============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_select_own" ON payments FOR SELECT USING (user_id = auth.uid());

-- =============================================================================
-- Support tickets
-- =============================================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_tickets_select_own" ON support_tickets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "support_tickets_insert_own" ON support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "support_tickets_update_own" ON support_tickets FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- Projects
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_select_own" ON projects FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "projects_insert_own" ON projects FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "projects_update_own" ON projects FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- =============================================================================
-- Portfolio clients (admin-managed)
-- =============================================================================
CREATE TABLE IF NOT EXISTS portfolio_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolio_clients_admin_only" ON portfolio_clients FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- Portfolio invoices (admin-managed)
-- =============================================================================
CREATE TABLE IF NOT EXISTS portfolio_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

ALTER TABLE portfolio_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portfolio_invoices_admin_only" ON portfolio_invoices FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- Activity logs (admin-managed)
-- =============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_logs_admin_only" ON activity_logs FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- Lead intake
-- =============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  phone TEXT,
  service_interest TEXT,
  budget_range TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_status ON leads(status);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_admin_only" ON leads FOR ALL
  USING (auth.role() = 'service_role');

-- =============================================================================
-- Line items (for invoices)
-- =============================================================================
CREATE TABLE IF NOT EXISTS line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES portfolio_invoices(id),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "line_items_admin_only" ON line_items FOR ALL
  USING (auth.role() = 'service_role');