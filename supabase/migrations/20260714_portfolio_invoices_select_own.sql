-- The client billing dashboard reads portfolio_invoices filtered by
-- user_id = auth.uid() (src/app/(client)/dashboard/billing/page.tsx), but the
-- table only had portfolio_invoices_admin_select (admin-only), so a client's
-- own invoices were never visible — Nova-Mir-Product-7dk. The billing writer
-- already stores the owning client's auth user in portfolio_invoices.user_id.
-- Applied to production 2026-07-14 via Management API.

DROP POLICY IF EXISTS "portfolio_invoices_select_own" ON portfolio_invoices;
CREATE POLICY "portfolio_invoices_select_own" ON portfolio_invoices FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
