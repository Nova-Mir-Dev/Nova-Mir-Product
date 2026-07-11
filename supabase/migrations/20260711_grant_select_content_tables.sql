-- RLS policies alone don't allow reads; table-level privileges are also required.
-- anon/authenticated had no SELECT grant on the content tables, so the public
-- content APIs (/api/content/pricing, /api/content/hero-headlines) returned 500.
-- Applied to production 2026-07-11 via Management API; kept here for reproducibility.

GRANT SELECT ON public.hero_headlines, public.pricing_tiers, public.portfolio_projects
  TO anon, authenticated;
