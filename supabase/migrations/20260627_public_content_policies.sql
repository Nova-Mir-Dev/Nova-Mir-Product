-- Allow public (unauthenticated) SELECT on published content tables
-- The API routes for hero headlines, portfolio projects, and pricing tiers
-- use the anon key and need RLS to allow reads.

CREATE POLICY IF NOT EXISTS "hero_headlines_public_select" ON hero_headlines FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY IF NOT EXISTS "portfolio_projects_public_select" ON portfolio_projects FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY IF NOT EXISTS "pricing_tiers_public_select" ON pricing_tiers FOR SELECT
  TO anon
  USING (is_published = true);
