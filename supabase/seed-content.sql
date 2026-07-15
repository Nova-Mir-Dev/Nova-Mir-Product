-- =============================================================================
-- Seed Content
--
-- Run via: psql -f supabase/seed-content.sql
-- Or via Supabase dashboard SQL editor.
--
-- Idempotent: DELETE first, then INSERT. Safe to run multiple times.
-- =============================================================================

-- =============================================================================
-- Pricing Tiers
-- =============================================================================

DELETE FROM pricing_tiers;

INSERT INTO pricing_tiers (name, slug, starting_price, description, features, founding_note, is_featured, sort_order, is_published)
VALUES
  (
    'Managed Website',
    'managed-website',
    1800,
    'Small businesses that need a credible online presence.',
    '["Custom-designed site","Mobile responsive","Contact form","SEO basics","Analytics","Hosting setup"]'::jsonb,
    NULL,
    false,
    1,
    true
  ),
  (
    'Website + Lead System',
    'website-lead-system',
    3000,
    'Businesses ready to capture and track leads.',
    '["Everything in Managed Website","Lead capture form","Email notifications","CRM / spreadsheet log","Confirmation messages","Simple reporting"]'::jsonb,
    'Founding rate — limited to 3 slots',
    true,
    2,
    true
  ),
  (
    'Website + Operations',
    'website-ops-system',
    5000,
    'Businesses needing booking, payments, and dashboards.',
    '["Everything in Website + Lead System","Booking / intake workflows","Payment & deposit flow","Dashboard","Automated follow-up","System documentation"]'::jsonb,
    NULL,
    false,
    3,
    true
  );

-- =============================================================================
-- Portfolio Projects
-- =============================================================================

DELETE FROM portfolio_projects;

INSERT INTO portfolio_projects (title, slug, description, href, thumbnail_url, status, sort_order, is_published)
VALUES
  (
    'Nova Mir Website',
    'nova-mir-website',
    'Studio site for a web development business',
    '/portfolio',
    NULL,
    'published',
    1,
    true
  ),
  (
    'jcrose.dev',
    'jcrose-dev',
    'Personal site',
    'https://jcrose.dev',
    NULL,
    'published',
    2,
    true
  );

-- =============================================================================
-- Public Navigation Links
-- =============================================================================

DELETE FROM public_nav_links;

INSERT INTO public_nav_links (label, path, section, sort_order, is_published)
VALUES
  ('Home',      '/',         'main',   1, true),
  ('Services',  '/services', 'main',   2, true),
  ('Process',   '/process',  'main',   3, true),
  ('Portfolio', '/portfolio','main',   4, true),
  ('Pricing',   '/pricing',  'main',   5, true),
  ('Contact',   '/contact',  'main',   6, true),
  ('Contact',         '/contact', 'footer', 1, true),
  ('Privacy Policy',  '/privacy', 'footer', 2, true),
  ('Terms of Service','/terms',   'footer', 3, true);

-- =============================================================================
-- Hero Headlines
-- =============================================================================

DELETE FROM hero_headlines;

-- Active headline (published, sort_order 1)
INSERT INTO hero_headlines (headline, subtitle, cta_label, cta_href, industry, sort_order, is_published)
VALUES (
  'A new kind of website for your business.',
  'No templates. No runaround. Just a site that actually works for you.',
  'Get Started',
  '/contact',
  NULL,
  1,
  true
);

-- Industry variants (unpublished, sort_order 2-9)
INSERT INTO hero_headlines (headline, subtitle, cta_label, cta_href, industry, sort_order, is_published)
VALUES
  (
    'Your professional services firm deserves a website that brings in clients.',
    'Not a template. Not a brochure. A lead-generating machine for your firm.',
    'Get Started',
    '/contact',
    'professional-services',
    2,
    false
  ),
  (
    'Help more patients find you — not a website that just sits there.',
    'A clean, trustworthy site that makes it easy for new clients to book.',
    'Get Started',
    '/contact',
    'health-wellness',
    3,
    false
  ),
  (
    'Your local service business should be easy to find and impossible to forget.',
    'Stand out from competitors with a site that actually brings in leads.',
    'Get Started',
    '/contact',
    'local-service',
    4,
    false
  ),
  (
    'Your hospitality brand needs a website as warm as your welcome.',
    'Showcase your space, streamline bookings, and keep guests coming back.',
    'Get Started',
    '/contact',
    'hospitality',
    5,
    false
  ),
  (
    'Your creative portfolio should open doors — not sit in a tab.',
    'Show your best work in a site that loads fast, looks sharp, and gets you hired.',
    'Get Started',
    '/contact',
    'creative',
    6,
    false
  ),
  (
    'A small business website that actually works for small business owners.',
    'No templates. No runaround. Just a site that brings in customers while you run your business.',
    'Get Started',
    '/contact',
    'general-small-business',
    7,
    false
  ),
  (
    'Your home service business deserves more than a Facebook page.',
    'Get found, get called, get booked — with a website built for home services.',
    'Get Started',
    '/contact',
    'home-services',
    8,
    false
  ),
  (
    'A website that grows as fast as your ambition.',
    'Start lean, scale up. From a simple site to a full operations system.',
    'Get Started',
    '/contact',
    'general-small-business-aspiration',
    9,
    false
  );
