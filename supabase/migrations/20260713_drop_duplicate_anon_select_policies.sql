-- Each content table carried two identical anon SELECT policies: an early
-- *_anon_select and the *_public_select set maintained in
-- 20260627_public_content_policies.sql. Keep the maintained set
-- (Nova-Mir-Product-wka). Applied to production 2026-07-13.

DROP POLICY IF EXISTS "hero_headlines_anon_select" ON public.hero_headlines;
DROP POLICY IF EXISTS "portfolio_projects_anon_select" ON public.portfolio_projects;
DROP POLICY IF EXISTS "pricing_tiers_anon_select" ON public.pricing_tiers;
