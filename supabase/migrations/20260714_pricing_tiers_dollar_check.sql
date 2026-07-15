-- pricing_tiers.starting_price is denominated in whole DOLLARS and rendered
-- raw by every consumer. Rows had been seeded with cents-magnitude values
-- (150000 = $1,500) which the UI showed as "$150,000+" on the live site —
-- Nova-Mir-Product-e4j. This constraint keeps the unit unambiguous: real
-- package prices are $1,800–$5,000, so anything >= 100000 is a cents/dollars
-- mistake, not a real price.
-- Applied to production 2026-07-14 via Management API.

ALTER TABLE pricing_tiers DROP CONSTRAINT IF EXISTS pricing_tiers_starting_price_dollars;
ALTER TABLE pricing_tiers
  ADD CONSTRAINT pricing_tiers_starting_price_dollars
  CHECK (starting_price >= 0 AND starting_price < 100000);
