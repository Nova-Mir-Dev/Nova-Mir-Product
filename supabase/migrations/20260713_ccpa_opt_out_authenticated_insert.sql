-- The /do-not-sell page is public, so /api/compliance/opt-out must accept both
-- anonymous visitors (anon role, existing ccpa_opt_outs_anon_insert policy)
-- and logged-in users (authenticated role, which had no INSERT policy) —
-- Nova-Mir-Product-46q. The route is also added to the middleware public API
-- allowlist; its own rate limit + Zod validation are the guards.
-- Applied to production 2026-07-13 via Management API.

DROP POLICY IF EXISTS "ccpa_opt_outs_authenticated_insert" ON ccpa_opt_outs;
CREATE POLICY "ccpa_opt_outs_authenticated_insert" ON ccpa_opt_outs FOR INSERT
  TO authenticated
  WITH CHECK (true);
