-- Allow public (unauthenticated) SELECT on published content tables
-- The API routes for hero headlines, portfolio projects, and pricing tiers
-- use the anon key and need RLS to allow reads.

DROP POLICY IF EXISTS "hero_headlines_public_select" ON hero_headlines;
CREATE POLICY "hero_headlines_public_select" ON hero_headlines FOR SELECT
  TO anon
  USING (is_published = true);

DROP POLICY IF EXISTS "portfolio_projects_public_select" ON portfolio_projects;
CREATE POLICY "portfolio_projects_public_select" ON portfolio_projects FOR SELECT
  TO anon
  USING (is_published = true);

DROP POLICY IF EXISTS "pricing_tiers_public_select" ON pricing_tiers;
CREATE POLICY "pricing_tiers_public_select" ON pricing_tiers FOR SELECT
  TO anon
  USING (is_published = true);
