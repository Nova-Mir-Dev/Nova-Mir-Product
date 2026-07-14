-- RLS policies do nothing without table-level privileges. Most public-schema
-- tables were created without Supabase's default grants, so anon /
-- authenticated / service_role had no access at all (Nova-Mir-Product-ntv).
-- Least-privilege mapping cross-checked against route code (supabase-admin.ts
-- routes run as service_role; supabase-server.ts routes as authenticated;
-- lead capture and public content as anon) and against pg_policies.
-- Applied to production 2026-07-13 via Management API; kept for reproducibility.

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.appointments, public.documents, public.support_tickets,
  public.projects, public.sessions, public.signatures
TO authenticated;

GRANT SELECT ON
  public.line_items, public.payments, public.portfolio_invoices,
  public.portfolio_clients, public.users, public.activity_logs,
  public.public_nav_links, public.process_steps, public.testimonials,
  public.content_history, public.leads, public.audit_logs, public.api_keys,
  public.ccpa_opt_outs, public.hero_headlines, public.pricing_tiers,
  public.portfolio_projects
TO authenticated;

-- /api/compliance/opt-out inserts with the session client
GRANT INSERT ON public.ccpa_opt_outs TO authenticated;
-- /api/compliance/data-correction updates the caller's own users row
GRANT UPDATE ON public.users TO authenticated;

GRANT SELECT ON
  public.public_nav_links, public.process_steps, public.testimonials,
  public.hero_headlines, public.pricing_tiers, public.portfolio_projects
TO anon;
GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.ccpa_opt_outs TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public
  TO authenticated, service_role;

-- Pre-existing stray grants: anon/authenticated held TRUNCATE (not subject to
-- RLS), REFERENCES, and TRIGGER on every table. None are used by the app.
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public
  FROM anon, authenticated;

-- Prevent this class of bug for future tables created as postgres
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;
